
"use client"

import * as React from "react"
import { Volume2, Music, Circle, Play, Square, Pause, Waves, Download, Keyboard } from "lucide-react"

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
import type { KeyCount } from "@/app/page";
import { NOTE_NAMES } from "@/lib/notes";
import { scaleTypes, Scale } from "@/lib/scales";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";


interface MainControlsProps {
  instrument: string;
  onInstrumentChange: (value: string) => void;
  instruments: { value: string; label: string }[];
  onVolumeChange: (value: number[]) => void;
  onSustainChange: (value: number[]) => void;
  isRecording: boolean;
  isPlaying: boolean;
  onRecord: () => void;
  onPlay: () => void;
  onDownload: () => void;
  disabled?: boolean;
  keyCount: KeyCount;
  onKeyCountChange: (value: string) => void;
  scaleRoot: string;
  onScaleRootChange: (value: string) => void;
  scaleType: Scale;
  onScaleTypeChange: (value: Scale) => void;
  showNoteNames: boolean;
  onShowNoteNamesChange: (checked: boolean) => void;
}

const keyCountOptions: { value: KeyCount, label: string }[] = [
    { value: 37, label: '37 Keys' },
    { value: 61, label: '61 Keys' },
    { value: 88, label: '88 Keys' },
];

export default function MainControls({
  instrument,
  onInstrumentChange,
  instruments,
  onVolumeChange,
  onSustainChange,
  isRecording,
  isPlaying,
  onRecord,
  onPlay,
  onDownload,
  disabled = false,
  keyCount,
  onKeyCountChange,
  scaleRoot,
  onScaleRootChange,
  scaleType,
  onScaleTypeChange,
  showNoteNames,
  onShowNoteNamesChange,
}: MainControlsProps) {
  return (
    <Card className="w-full shadow-lg">
      <CardContent className="p-3">
        <TooltipProvider>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {/* Key Count Selector */}
            <div className="flex items-center gap-2">
                <Keyboard className="text-muted-foreground" />
                <Select value={String(keyCount)} onValueChange={onKeyCountChange} disabled={disabled}>
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Keys" />
                    </SelectTrigger>
                    <SelectContent>
                        {keyCountOptions.map((opt) => (
                            <SelectItem key={opt.value} value={String(opt.value)}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
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
            
            <Separator orientation="vertical" className="h-8 hidden md:block" />

            {/* Scale Selector */}
            <div className="flex items-center gap-2">
                <Select value={scaleRoot} onValueChange={onScaleRootChange} disabled={disabled}>
                    <SelectTrigger className="w-[90px]">
                        <SelectValue placeholder="Root" />
                    </SelectTrigger>
                    <SelectContent>
                        {NOTE_NAMES.map((note) => (
                            <SelectItem key={note} value={note}>
                                {note}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={scaleType} onValueChange={onScaleTypeChange} disabled={disabled}>
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Scale" />
                    </SelectTrigger>
                    <SelectContent>
                        {scaleTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
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
              <Tooltip>
                <TooltipTrigger asChild>
                    <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={onDownload}
                        aria-label="Download Recording"
                        disabled={disabled || isRecording || isPlaying}
                    >
                        <Download />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Download Recording</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-8 hidden md:block" />

            {/* Show Notes Toggle */}
            <div className="flex items-center space-x-2">
                <Switch 
                    id="show-notes" 
                    checked={showNoteNames} 
                    onCheckedChange={onShowNoteNamesChange}
                    disabled={disabled}
                />
                <Label htmlFor="show-notes">Show Notes</Label>
            </div>

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
