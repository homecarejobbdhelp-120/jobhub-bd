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
      <DialogContent className="sm:max-w-md backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Authentication Required</DialogTitle>
          <DialogDescription className="pt-4 text-center">
            Please log in or sign up to continue.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-3 sm:flex-col sm:gap-3 mt-2">
          <Button 
            onClick={handleSignIn} 
            className="w-full bg-[#6DBE45] hover:bg-[#6DBE45]/90 text-white"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Login
          </Button>
          <Button 
            onClick={handleSignUp} 
            className="w-full bg-[#0B4A79] hover:bg-[#0B4A79]/90 text-white"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Sign Up
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LoginPrompt;
