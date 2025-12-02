import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarPickerProps {
  gender: string | null;
  currentAvatar: string | null;
  onSelect: (avatarUrl: string) => void;
}

// Default avatar URLs from Supabase storage
const MALE_AVATARS = [
  "https://kmthjcwipphhziyicgzg.supabase.co/storage/v1/object/public/avatars/defaults/male-1.png",
  "https://kmthjcwipphhziyicgzg.supabase.co/storage/v1/object/public/avatars/defaults/male-2.png",
  "https://kmthjcwipphhziyicgzg.supabase.co/storage/v1/object/public/avatars/defaults/male-3.png",
  "https://kmthjcwipphhziyicgzg.supabase.co/storage/v1/object/public/avatars/defaults/male-4.png",
  "https://kmthjcwipphhziyicgzg.supabase.co/storage/v1/object/public/avatars/defaults/male-5.png",
];

const FEMALE_AVATARS = [
  "https://kmthjcwipphhziyicgzg.supabase.co/storage/v1/object/public/avatars/defaults/female-1.png",
  "https://kmthjcwipphhziyicgzg.supabase.co/storage/v1/object/public/avatars/defaults/female-2.png",
  "https://kmthjcwipphhziyicgzg.supabase.co/storage/v1/object/public/avatars/defaults/female-3.png",
  "https://kmthjcwipphhziyicgzg.supabase.co/storage/v1/object/public/avatars/defaults/female-4.png",
  "https://kmthjcwipphhziyicgzg.supabase.co/storage/v1/object/public/avatars/defaults/female-5.png",
];

const AvatarPicker = ({ gender, currentAvatar, onSelect }: AvatarPickerProps) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(currentAvatar);

  const avatars = gender === "female" ? FEMALE_AVATARS : MALE_AVATARS;

  const handleSelect = (url: string) => {
    setSelected(url);
    onSelect(url);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button 
          type="button"
          className="relative group"
          disabled={!gender}
        >
          <Avatar className="h-20 w-20 border-2 border-primary/20">
            <AvatarImage src={currentAvatar || undefined} alt="Avatar" />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl">
              {gender === "female" ? "F" : "M"}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-6 w-6 text-white" />
          </div>
          {!gender && (
            <p className="text-xs text-muted-foreground mt-1">Select gender first</p>
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Your Avatar</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-5 gap-3 py-4">
          {avatars.map((url, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(url)}
              className={cn(
                "relative rounded-full overflow-hidden border-2 transition-all",
                selected === url 
                  ? "border-primary ring-2 ring-primary ring-offset-2" 
                  : "border-transparent hover:border-primary/50"
              )}
            >
              <Avatar className="h-14 w-14">
                <AvatarImage src={url} alt={`Avatar ${index + 1}`} />
                <AvatarFallback>{index + 1}</AvatarFallback>
              </Avatar>
              {selected === url && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <Check className="h-6 w-6 text-primary" />
                </div>
              )}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarPicker;
