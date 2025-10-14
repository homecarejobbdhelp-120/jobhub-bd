import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Link as LinkIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ShareModal = ({ open, onOpenChange }: ShareModalProps) => {
  const [copied, setCopied] = useState(false);
  const siteUrl = "https://homecarejobbd.vercel.app";
  const shareMessage = "Find your perfect home care job at HomeCare Job BD!";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(siteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(`${shareMessage} ${siteUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareViaFacebook = () => {
    const url = encodeURIComponent(siteUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#0B4A79]">Share Website</DialogTitle>
          <DialogDescription>
            Share this website with your friends so they can find the perfect home care job!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <Button
            onClick={copyToClipboard}
            variant="outline"
            className="w-full justify-start gap-3 h-12"
          >
            {copied ? (
              <>
                <Check className="h-5 w-5 text-[#6DBE45]" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <LinkIcon className="h-5 w-5" />
                <span>Copy Link</span>
              </>
            )}
          </Button>

          <Button
            onClick={shareViaWhatsApp}
            variant="outline"
            className="w-full justify-start gap-3 h-12"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>Share via WhatsApp</span>
          </Button>

          <Button
            onClick={shareViaFacebook}
            variant="outline"
            className="w-full justify-start gap-3 h-12"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>Share via Facebook</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
