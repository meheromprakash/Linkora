import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Download, ExternalLink, Copy } from 'lucide-react';
import { useToast } from './ui/Toast';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortUrl: string;
  title: string;
}

export const QRModal: React.FC<QRModalProps> = ({
  isOpen,
  onClose,
  shortUrl,
  title,
}) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `linkora-qr-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
    link.href = url;
    link.click();
    toast('QR Code downloaded successfully!', 'success');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    toast('Short link copied to clipboard!', 'success');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="QR Code Generator">
      <div className="flex flex-col items-center gap-6 py-2">
        <div
          ref={qrRef}
          className="p-5 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-slate-700"
        >
          <QRCodeCanvas
            value={shortUrl}
            size={200}
            bgColor="#FFFFFF"
            fgColor="#090D16"
            level="H"
            includeMargin={true}
          />
        </div>

        <div className="text-center space-y-1">
          <h4 className="font-bold text-slate-100 text-base">{title}</h4>
          <p className="text-xs text-brand-neon font-mono select-all flex items-center justify-center gap-1.5">
            {shortUrl}
            <button onClick={handleCopy} title="Copy link">
              <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
            </button>
          </p>
        </div>

        <div className="flex items-center gap-3 w-full pt-2 border-t border-slate-800">
          <Button
            variant="outline"
            className="flex-1"
            icon={<ExternalLink className="w-4 h-4" />}
            onClick={() => window.open(shortUrl, '_blank')}
          >
            Visit Link
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            icon={<Download className="w-4 h-4" />}
            onClick={handleDownload}
          >
            Download PNG
          </Button>
        </div>
      </div>
    </Modal>
  );
};
