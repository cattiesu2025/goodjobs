import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { speak, stopSpeaking } from "@/lib/tts";
import { api } from "@/lib/api";
import type { InterviewQuestion } from "@/lib/types";

interface Props {
  question: InterviewQuestion;
  onUpdate: () => void;
  onDelete: () => void;
}

export function QuestionCard({ question, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [answer, setAnswer] = useState(question.answer ?? "");
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(false);

  const saveAnswer = async () => {
    await api.updateQuestion(question.id, { ...question, answer });
    setEditing(false);
    onUpdate();
  };

  const handlePlay = () => {
    if (playing) {
      stopSpeaking();
      setPlaying(false);
    } else if (answer) {
      setPlaying(true);
      speak(answer, speed);
      // Use the speechSynthesis onend event to reset playing state
      const checkEnd = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          setPlaying(false);
          clearInterval(checkEnd);
        }
      }, 200);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline">{question.label}</Badge>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={() => setEditing(!editing)}>
              Edit
            </Button>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={onDelete}>
              Delete
            </Button>
          </div>
        </div>
        <div className="font-medium pt-1">{question.question}</div>
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="space-y-2">
            <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={6} />
            <div className="flex gap-2">
              <Button size="sm" onClick={saveAnswer}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground whitespace-pre-wrap">
            {answer || "No answer yet — click Edit to add one."}
          </div>
        )}

        {answer && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t">
            <Button size="sm" variant="outline" onClick={handlePlay}>
              {playing ? "Stop" : "Play Answer"}
            </Button>
            <div className="flex items-center gap-1 text-sm">
              <span>Speed:</span>
              {[0.5, 0.75, 1, 1.25].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-1.5 py-0.5 rounded text-xs ${
                    speed === s ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
