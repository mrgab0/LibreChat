import { memo, useMemo } from 'react';
import { ProviderIcon } from '@librechat/client';
import type { ProviderId } from 'librechat-data-provider';
import { URLIcon } from '~/components/Endpoints/URLIcon';
import { isImageURL } from '~/utils/icons';

interface ConvoIconURLProps {
  iconURL?: string;
  modelLabel?: string | null;
  provider?: ProviderId | null;
  assistantName?: string;
  agentName?: string;
  context?: 'landing' | 'menu-item' | 'nav' | 'message';
  assistantAvatar?: string;
  agentAvatar?: string;
}

const classMap = {
  'menu-item': 'relative flex h-full items-center justify-center overflow-hidden rounded-full',
  message: 'icon-md',
  default: 'icon-xl relative flex h-full overflow-hidden rounded-full',
};

const styleMap = {
  'menu-item': { width: '20px', height: '20px' },
  default: { width: '100%', height: '100%' },
};

const styleImageMap = {
  default: { width: '100%', height: '100%' },
};

const ConvoIconURL: React.FC<ConvoIconURLProps> = ({
  iconURL = '',
  modelLabel = '',
  provider,
  context,
}) => {
  const isURL = useMemo(() => isImageURL(iconURL), [iconURL]);
  if (isURL) {
    return (
      <URLIcon
        iconURL={iconURL}
        altName={modelLabel}
        className={classMap[context ?? 'default'] ?? classMap.default}
        containerStyle={styleMap[context ?? 'default'] ?? styleMap.default}
        imageStyle={styleImageMap[context ?? 'default'] ?? styleImageMap.default}
      />
    );
  }

  return (
    <div className="shadow-stroke relative flex h-full items-center justify-center rounded-md border border-border-medium bg-surface-tertiary p-0.5 text-text-primary">
      <img src="/assets/logo.svg" className="h-full w-full object-contain rounded-xs" alt="VaKA LLM" />
    </div>
  );
};

export default memo(ConvoIconURL);
