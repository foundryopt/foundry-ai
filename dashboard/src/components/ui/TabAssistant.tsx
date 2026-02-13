'use client';

import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type AssistantContext =
  | 'attention'
  | 'budget'
  | 'schedule'
  | 'procurement'
  | 'quality'
  | 'warranty'
  | 'design'
  | 'takt'
  | 'development'
  | 'sales'
  | 'general';

interface TabAssistantProps {
  context: AssistantContext;
  tabLabel: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

/* ------------------------------------------------------------------ */
/*  Quick-action chips per context                                     */
/* ------------------------------------------------------------------ */

const QUICK_ACTIONS: Record<AssistantContext, string[]> = {
  attention: ['Draft Daily Report', 'Create RFI', 'Log Issue'],
  budget: ['Draft Change Order', 'Review Invoice', 'Budget Alert'],
  schedule: ['Update Milestone', 'Flag Delay', 'Draft Variance Report'],
  procurement: ['Track Delivery', 'Draft PO', 'Vendor Follow-up'],
  quality: ['Log Inspection', 'NCR Report', 'Punch List Item'],
  warranty: ['Log Claim', 'Draft Response', 'Warranty Report'],
  design: ['Add Submittal', 'Request Review', 'Log RFI'],
  takt: ['Update Takt Board', 'Log Roadblock', 'Huddle Notes'],
  development: ['Draft Report', 'Update Milestone', 'Flag Issue'],
  sales: ['Draft Proposal', 'Log Lead', 'Schedule Tour'],
  general: ['Draft Report', 'Add Note', 'Create Task'],
};

/* ------------------------------------------------------------------ */
/*  Simulated AI response generator                                    */
/* ------------------------------------------------------------------ */

function generateResponse(userText: string, context: AssistantContext): string {
  const lower = userText.toLowerCase();

  if (lower.includes('draft') || lower.includes('report'))
    return `I've drafted a report based on your input for the ${context} area. Please review and edit as needed.`;
  if (lower.includes('rfi') || lower.includes('request'))
    return `I've prepared an RFI draft referencing the current ${context} data. Please review the details before submitting.`;
  if (lower.includes('change order') || lower.includes('co'))
    return `I've drafted a Change Order based on your input. The cost impact and justification are included for your review.`;
  if (lower.includes('invoice') || lower.includes('review'))
    return `I've reviewed the relevant invoice data and flagged items that need attention. See the summary below.`;
  if (lower.includes('inspection') || lower.includes('log'))
    return `I've logged the item and created a follow-up task. Please confirm the details are correct.`;
  if (lower.includes('delay') || lower.includes('flag'))
    return `I've flagged the potential delay and notified the relevant team members. A variance note has been drafted.`;
  if (lower.includes('punch') || lower.includes('list'))
    return `I've added the punch list item with the details you provided. It's been assigned for follow-up.`;
  if (lower.includes('milestone') || lower.includes('update'))
    return `I've updated the milestone status. The schedule impact has been calculated and is ready for review.`;

  return `I've drafted a ${context} document based on your input. Please review and edit as needed.`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function TabAssistant({ context, tabLabel }: TabAssistantProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Auto-scroll to bottom on new messages */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  /* Focus input when panel opens */
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setUnread(0);
    }
  }, [open]);

  /* ---- send handler ---- */
  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: generateResponse(trimmed, context),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
      if (!open) setUnread((n) => n + 1);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const quickActions = QUICK_ACTIONS[context] ?? QUICK_ACTIONS.general;

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <>
      {/* ---------- Floating trigger button ---------- */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 transition-colors"
          aria-label="Open AI Assistant"
        >
          {/* Chat bubble icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>

          {/* Unread badge */}
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unread}
            </span>
          )}
        </button>
      )}

      {/* ---------- Expanded panel ---------- */}
      {open && (
        <div className="fixed bottom-0 right-0 z-50 w-full sm:w-[420px] sm:right-6 sm:bottom-6 flex flex-col bg-white rounded-t-xl sm:rounded-xl shadow-xl border border-gray-200 overflow-hidden"
          style={{ maxHeight: '400px' }}
        >
          {/* ---- Header ---- */}
          <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white shrink-0">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span className="text-sm font-semibold">AI Assistant</span>
              <span className="text-xs text-blue-200">{tabLabel}</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-blue-200 hover:text-white transition-colors"
              aria-label="Close assistant"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ---- Messages area ---- */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50"
          >
            {messages.length === 0 && !isTyping && (
              <div className="text-center text-xs text-gray-400 py-8">
                <p className="font-medium text-gray-500 mb-1">How can I help?</p>
                <p>Ask me to draft documents, log items, or review data for {tabLabel}.</p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={clsx(
                  'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                  msg.role === 'user'
                    ? 'ml-auto bg-blue-600 text-white'
                    : 'mr-auto bg-white text-gray-800 border border-gray-200',
                )}
              >
                {msg.text}
              </div>
            ))}

            {isTyping && (
              <div className="mr-auto flex items-center gap-1 rounded-lg bg-white border border-gray-200 px-3 py-2 text-sm text-gray-400">
                <span className="animate-pulse">...</span>
                <span className="text-xs">typing</span>
              </div>
            )}
          </div>

          {/* ---- Quick actions ---- */}
          <div className="flex gap-2 px-4 py-2 bg-white border-t border-gray-100 overflow-x-auto shrink-0">
            {quickActions.map((action) => (
              <button
                key={action}
                onClick={() => send(action)}
                className="whitespace-nowrap rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
              >
                {action}
              </button>
            ))}
          </div>

          {/* ---- Input bar ---- */}
          <div className="flex items-center gap-2 px-4 py-3 bg-white border-t border-gray-200 shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask about ${tabLabel.toLowerCase()}...`}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim()}
              className={clsx(
                'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                input.trim()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed',
              )}
              aria-label="Send message"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12h14M12 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
