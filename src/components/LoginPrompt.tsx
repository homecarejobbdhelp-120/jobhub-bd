import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus, LogIn } from "lucide-react";

interface LoginPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LoginPrompt = ({ open, onOpenChange }: LoginPromptProps) => {
  const navigate = useNavigate();

  const handleSignUp = () => {
    onOpenChange(false);
    navigate("/signup");
  };

  const handleSignIn = () => {
    onOpenChange(false);
    navigate("/login");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[420px] mx-auto p-6 sm:p-8 rounded-xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-center text-xl sm:text-2xl font-bold">
            Authentication Required
          </DialogTitle>
          <DialogDescription className="text-center text-sm sm:text-base">
            Please log in or sign up to continue.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-3 mt-6 sm:mt-8">
          <Button 
            onClick={handleSignIn} 
            className="w-full h-11 sm:h-12 bg-[#6DBE45] hover:bg-[#6DBE45]/90 text-white text-base font-semibold"
          >
            <LogIn className="mr-2 h-5 w-5" />
            Login
          </Button>
          <Button 
            onClick={handleSignUp} 
            className="w-full h-11 sm:h-12 bg-[#0B4A79] hover:bg-[#0B4A79]/90 text-white text-base font-semibold"
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Sign Up
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LoginPrompt;
