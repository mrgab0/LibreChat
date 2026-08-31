import React, { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { MessageSquare, Plus, ChevronDown, Search } from 'lucide-react';
import { useConversationsInfiniteQuery } from '~/data-provider';
import { useAuthContext, useNavigateToConvo, useNewConvo, useLocalize } from '~/hooks';
import { cn } from '~/utils';

export default function ConvoPopoverMenu() {
  const localize = useLocalize();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated } = useAuthContext();
  const { newConversation } = useNewConvo();
  const { navigateToConvo } = useNavigateToConvo();

  const { data, isLoading } = useConversationsInfiniteQuery(
    { search: searchQuery || undefined },
    { enabled: isAuthenticated, staleTime: 10000 },
  );

  const conversations = data?.pages.flatMap((page) => page.conversations) ?? [];

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className="flex items-center gap-1.5 rounded-xl border border-border-medium bg-surface-tertiary px-2.5 py-1.5 text-xs sm:text-sm font-semibold text-text-primary hover:bg-surface-active-alt transition-all shadow-xs"
          aria-label={localize('com_nav_chats') || 'Mis Chats'}
        >
          <MessageSquare className="size-4 text-primary" />
          <span className="inline">Mis Chats</span>
          <ChevronDown className="size-3.5 opacity-70" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          className="z-[1000] w-80 max-h-[460px] overflow-hidden rounded-2xl border border-border-medium/70 bg-surface-primary/95 backdrop-blur-md p-3 shadow-2xl transition-all text-text-primary flex flex-col gap-2.5"
        >
          {/* Header Controls */}
          <div className="flex items-center justify-between gap-2 border-b border-border-light pb-2">
            <span className="font-bold text-xs uppercase tracking-wider text-text-secondary">
              Conversaciones
            </span>
            <button
              onClick={() => {
                newConversation();
                setOpen(false);
              }}
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <Plus className="size-3.5" /> Nuevo Chat
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 size-3.5 text-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar conversación..."
              className="w-full rounded-lg border border-border-medium bg-surface-tertiary pl-8 pr-3 py-1 text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {isLoading ? (
              <div className="p-4 text-center text-xs text-text-tertiary">Cargando...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-xs text-text-tertiary">No hay conversaciones</div>
            ) : (
              conversations.map((convo) => (
                <button
                  key={convo.conversationId}
                  onClick={() => {
                    navigateToConvo(convo);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 rounded-xl p-2 text-left hover:bg-surface-active-alt transition-colors group"
                >
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border border-border-medium bg-surface-tertiary p-0.5">
                    <img src="/assets/logo.svg" className="h-full w-full object-contain" alt="VaKA LLM" />
                  </div>
                  <span className="truncate text-xs text-text-primary group-hover:text-primary font-medium flex-1">
                    {convo.title || 'Nuevo Chat'}
                  </span>
                </button>
              ))
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
