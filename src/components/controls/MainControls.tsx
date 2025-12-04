
"use client"

import * as React from "react"
import { Volume2, Music, Drum, Circle, Play, Square, Pause, Waves } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface MainControlsProps {
  instrument: string;
  onInstrumentChange: (value: string) => void;
  instruments: { value: string; label: string }[];
  rhythm: string;
  onRhythmChange: (value: string) => void;
  rhythms: { value: string; label: string }[];
  onVolumeChange: (value: number[]) => void;
  onSustainChange: (value: number[]) => void;
  isRecording: boolean;
  isPlaying: boolean;
  onRecord: () => void;
  onPlay: () => void;
  disabled?: boolean;
}

export default function MainControls({
  instrument,
  onInstrumentChange,
  instruments,
  rhythm,
  onRhythmChange,
  rhythms,
  onVolumeChange,
  onSustainChange,
  isRecording,
  isPlaying,
  onRecord,
  onPlay,
  disabled = false,
}: MainControlsProps) {
  return (
    <Card className="w-full shadow-lg">
      <CardContent className="p-3">
        <TooltipProvider>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {/* Tone Selector */}
            <div className="flex items-center gap-2">
              <Music className="text-muted-foreground" />
              <Select value={instrument} onValueChange={onInstrumentChange} disabled={disabled}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Tone" />
                </SelectTrigger>
                <SelectContent>
                  {instruments.map((inst) => (
                    <SelectItem key={inst.value} value={inst.value}>
                      {inst.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rhythm Selector */}
            <div className="flex items-center gap-2">
              <Drum className="text-muted-foreground" />
              <Select value={rhythm} onValueChange={onRhythmChange} disabled={disabled}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Rhythm" />
                </SelectTrigger>
                <SelectContent>
                  {rhythms.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Separator orientation="vertical" className="h-8 hidden md:block" />

            {/* Recording Controls */}
            <div className="flex items-center gap-2">
               <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    size="icon"
                    onClick={onRecord}
                    aria-label={isRecording ? "Stop Recording" : "Record"}
                    disabled={disabled}
                  >
                    {isRecording ? <Square className="fill-current" /> : <Circle className="text-destructive" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isRecording ? "Stop Recording" : "Record (R)"}</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={onPlay}
                    aria-label={isPlaying ? "Pause Playback" : "Play Recording"}
                    disabled={disabled}
                    className={isPlaying ? "text-accent" : ""}
                  >
                    {isPlaying ? <Pause className="fill-current" /> : <Play />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isPlaying ? "Pause Playback" : "Play Recording (P)"}</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-8 hidden md:block" />

            {/* Sustain Control */}
             <div className="flex items-center gap-3 w-full max-w-[150px]">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Waves />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Sustain</p>
                    </TooltipContent>
                </Tooltip>
                <Slider
                    defaultValue={[0.1]}
                    max={2}
                    step={0.1}
                    onValueChange={onSustainChange}
                    aria-label="Sustain"
                    disabled={disabled}
                />
             </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3 w-full max-w-[150px]">
              <Volume2 className="text-muted-foreground" />
              <Slider
                defaultValue={[75]}
                max={100}
                step={1}
                onValueChange={(value) => onVolumeChange(value)}
                aria-label="Volume"
                disabled={disabled}
              />
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}
