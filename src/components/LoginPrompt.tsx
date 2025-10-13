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
    navigate("/auth");
  };

  const handleSignIn = () => {
    onOpenChange(false);
    navigate("/auth");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Account Required</DialogTitle>
          <DialogDescription className="pt-4">
            You need to have an account to apply for jobs. Please sign up or sign in to continue.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col sm:gap-2">
          <Button onClick={handleSignUp} className="w-full">
            <UserPlus className="mr-2 h-4 w-4" />
            Sign Up (Recommended)
          </Button>
          <Button onClick={handleSignIn} variant="outline" className="w-full">
            <LogIn className="mr-2 h-4 w-4" />
            Already have an account? Sign In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LoginPrompt;
