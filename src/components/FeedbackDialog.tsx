import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle: string;
  reportId: string;
  onSubmitFeedback: (rating: number, feedback: string) => void;
}

export function FeedbackDialog({
  isOpen,
  onClose,
  reportTitle,
  reportId,
  onSubmitFeedback
}: FeedbackDialogProps) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide a rating before submitting",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitFeedback(rating, feedback);
      toast({
        title: "Thank You!",
        description: "Your feedback has been submitted successfully",
      });
      onClose();
      setRating(0);
      setFeedback('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="h-16 w-16 bg-success/10 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </div>
          <DialogTitle className="text-center">
            Task Completed!
          </DialogTitle>
          <DialogDescription className="text-center">
            Your report "{reportTitle}" has been completed. Please rate your experience.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">
              Report ID: {reportId}
            </Badge>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Rate your satisfaction:</label>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setRating(star)}
                  className="p-1 h-auto"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= rating
                        ? 'fill-warning text-warning'
                        : 'text-muted-foreground'
                    }`}
                  />
                </Button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                {rating === 1 && "Very Dissatisfied"}
                {rating === 2 && "Dissatisfied"}
                {rating === 3 && "Neutral"}
                {rating === 4 && "Satisfied"}
                {rating === 5 && "Very Satisfied"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Additional Comments (Optional):</label>
            <Textarea
              placeholder="Share your experience or suggestions for improvement..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Skip
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}