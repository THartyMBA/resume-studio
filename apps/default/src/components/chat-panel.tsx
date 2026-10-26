import { useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { createConversation, createAgentChat } from '@/lib/agent-chat/v2';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from '@/components/ai-elements/tool';
import {
  Confirmation,
  ConfirmationTitle,
  ConfirmationRequest,
  ConfirmationAccepted,
  ConfirmationRejected,
  ConfirmationActions,
  ConfirmationAction,
} from '@/components/ai-elements/confirmation';
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from '@/components/ai-elements/prompt-input';
import { Suggestions, Suggestion } from '@/components/ai-elements/suggestion';
import { isToolUIPart } from 'ai';
import type { UIMessage } from 'ai';
import { ulid } from 'ulidx';
import { useResumeStore } from '@/stores/resume-store';
import { UploadZone } from '@/components/upload-zone';
import { Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AGENT_ID = '01KQWJVF6W61MW1M8BDHCSKHTN';

export function ChatPanel() {
  const [chat, setChat] = useState<ReturnType<typeof createAgentChat> | null>(null);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState('');

  const startChat = async () => {
    if (initializing || chat) return;
    setInitializing(true);
    setError('');
    try {
      const { conversationId } = await createConversation(AGENT_ID);
      const c = createAgentChat(AGENT_ID, conversationId);
      setChat(c);
    } catch (e) {
      console.error(e);
      setError('Failed to connect to Resume Coach. Please try again.');
    } finally {
      setInitializing(false);
    }
  };

  useEffect(() => {
    startChat();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
        <p className="text-sm text-destructive">{error}</p>
        <button
          onClick={startChat}
          className="text-sm text-primary underline underline-offset-4 hover:text-primary/80"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Sparkles className="size-5 animate-pulse" />
          <span className="text-sm">Connecting to Resume Coach...</span>
        </div>
      </div>
    );
  }

  return <ActiveChat chat={chat} />;
}

function ActiveChat({ chat }: { chat: ReturnType<typeof createAgentChat> }) {
  const { messages, status, addToolApprovalResponse } = useChat({ chat, id: chat.id });
  const { uploadedText, setActiveView, parseResumeFromMarkdown } = useResumeStore();
  const [uploadedSent, setUploadedSent] = useState(false);

  const isSending = status === 'submitted' || status === 'streaming';
  const hasMessages = messages.length > 0;

  const handleSend = async (text: string) => {
    await chat.sendMessage({
      id: ulid(),
      role: 'user',
      parts: [{ type: 'text', text }],
    });
  };

  const handleUploadReady = async (text: string) => {
    if (!uploadedSent) {
      setUploadedSent(true);
      await handleSend(
        `Here's my current resume. Please review it and tell me what can be improved:\n\n${text}`
      );
    }
  };

  // Only an explicit, resume-only artifact may update the structured document.
  // Ordinary coaching messages often contain headings while discussing examples;
  // importing those messages polluted summaries and skills with chat prose.
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role !== 'assistant') return;
    const artifact = (lastMsg as UIMessage & { resumeArtifact?: string }).resumeArtifact?.trim();
    if (artifact) parseResumeFromMarkdown(artifact);
  }, [messages, parseResumeFromMarkdown]);

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
            <Sparkles className="size-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Resume Coach</h2>
            <p className="text-[10px] text-muted-foreground">AI-powered career advisor</p>
          </div>
        </div>
        <button
          onClick={() => setActiveView('preview')}
          className="text-xs text-primary hover:underline underline-offset-4"
        >
          View Resume →
        </button>
      </div>

      {/* Messages */}
      <Conversation className="flex-1">
        <ConversationContent className="p-4 space-y-1">
          {/* Welcome + Upload */}
          <AnimatePresence>
            {!hasMessages && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5 pt-4 pb-2"
              >
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 mb-2">
                    <Sparkles className="size-8 text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                    Let's Build Your Resume
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Upload what you have, or start a conversation — I'll guide you through creating a polished, job-winning resume.
                  </p>
                </div>

                <UploadZone onTextReady={handleUploadReady} />
              </motion.div>
            )}
          </AnimatePresence>

          {messages.map((msg) => (
            <Message key={msg.id} from={msg.role}>
              <MessageContent>
                <MessageParts message={msg} onApprove={addToolApprovalResponse} />
              </MessageContent>
            </Message>
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Suggestions */}
      {!hasMessages && (
        <div className="px-4 pb-2">
          <Suggestions>
            <Suggestion suggestion="Start from scratch — I have no resume yet" onClick={handleSend} />
            <Suggestion suggestion="I want to tailor my resume for a specific job posting" onClick={handleSend} />
            <Suggestion suggestion="Give me your top resume writing tips" onClick={handleSend} />
          </Suggestions>
        </div>
      )}

      {/* Input */}
      <div className="p-4 pt-2">
        <PromptInput onSubmit={({ text }) => handleSend(text)}>
          <PromptInputTextarea placeholder="Describe your experience, paste your resume, or ask for help..." />
          <PromptInputFooter>
            <PromptInputSubmit status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}

function MessageParts({
  message,
  onApprove,
}: {
  message: UIMessage;
  onApprove: ReturnType<typeof useChat>['addToolApprovalResponse'];
}) {
  return (
    <>
      {message.parts.map((part, i) => {
        const key = `${message.id}-${i}`;

        if (part.type === 'text') {
          return message.role === 'user' ? (
            <p key={key} className="whitespace-pre-wrap">
              {part.text}
            </p>
          ) : (
            <MessageResponse key={key}>{part.text}</MessageResponse>
          );
        }

        if (isToolUIPart(part)) {
          return (
            <Tool key={key}>
              <ToolHeader type={part.type} state={part.state} />
              <ToolContent>
                <ToolInput input={part.input} />
                <Confirmation approval={part.approval} state={part.state}>
                  <ConfirmationRequest>
                    <ConfirmationTitle>Allow this tool to run?</ConfirmationTitle>
                  </ConfirmationRequest>
                  <ConfirmationAccepted>Approved</ConfirmationAccepted>
                  <ConfirmationRejected>Rejected</ConfirmationRejected>
                  <ConfirmationActions>
                    <ConfirmationAction
                      variant="outline"
                      onClick={() =>
                        part.approval != null &&
                        onApprove({ id: part.approval.id, approved: false })
                      }
                    >
                      Deny
                    </ConfirmationAction>
                    <ConfirmationAction
                      onClick={() =>
                        part.approval != null &&
                        onApprove({ id: part.approval.id, approved: true })
                      }
                    >
                      Approve
                    </ConfirmationAction>
                  </ConfirmationActions>
                </Confirmation>
                <ToolOutput output={part.output} errorText={part.errorText} />
              </ToolContent>
            </Tool>
          );
        }

        return null;
      })}
    </>
  );
}
