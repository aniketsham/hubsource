"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { resourceService } from "@/services/resourceService";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import { ArrowLeft, Rocket } from "lucide-react";

const DIFFICULTY_LEVELS = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
] as const;

const schema = z.object({
  title: z.string().min(3, "Title is too short").max(100),
  url: z.string().url("Please enter a valid URL"),
  description: z.string().min(10, "Description is too short").max(500),
  category: z.string().min(1, "Please select a category"),
  difficulty: z.enum(DIFFICULTY_LEVELS),
  tags: z.string(),
  thumbnail: z
    .string()
    .url("Invalid thumbnail URL")
    .optional()
    .or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

export default function SubmitPage() {
  const { user } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: "",
      difficulty: "BEGINNER",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast.error("You must be logged in to submit");
      return;
    }

    try {
      const tagsArray = data.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      await resourceService.create({
        ...data,
        tags: tagsArray,
        postedBy: user.id,
        postedByName: user.name,
      });
      toast.success(
        "Resource submitted! It will be reviewed by admins shortly.",
      );
      router.push("/");
    } catch (error) {
      toast.error("Failed to submit resource");
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-8 py-20 text-center">
        <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">
          Access Denied
        </h2>
        <p className="text-foreground/70 mb-8 uppercase font-medium italic">
          You need to be logged in to contribute to the collective.
        </p>
        <Button
          onClick={() => router.push("/")}
          className="h-12 px-8 font-black uppercase shadow-neo"
        >
          Return Home
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-8 py-12 max-w-3xl">
      <Link
        href="/"
        className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-foreground/50 hover:text-black mb-8"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        BACK TO FEED
      </Link>

      <Card className="border-4 border-black shadow-neo-lg bg-white overflow-hidden">
        <CardHeader className="space-y-4 border-b-4 border-black p-8">
          <div className="h-16 w-16 bg-black text-white rounded-none flex items-center justify-center mb-2 shadow-neo">
            <Rocket className="h-8 w-8" />
          </div>
          <CardTitle className="text-4xl font-black uppercase tracking-tighter">
            Broadcast Signal
          </CardTitle>
          <CardDescription className="text-xs font-black uppercase tracking-widest text-foreground/70 italic">
            Share an elite tool, course, or article with the collective.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-3">
              <Label
                htmlFor="title"
                className="text-[10px] font-black uppercase tracking-widest"
              >
                Resource Title
              </Label>
              <Input
                id="title"
                placeholder="E.G. NEXT-GEN CSS TECHNIQUES"
                className="h-12 border-2 border-black font-bold uppercase"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-[10px] font-black text-destructive uppercase">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="url"
                className="text-[10px] font-black uppercase tracking-widest"
              >
                Source Link
              </Label>
              <Input
                id="url"
                placeholder="HTTPS://..."
                className="h-12 border-2 border-black font-bold"
                {...register("url")}
              />
              {errors.url && (
                <p className="text-[10px] font-black text-destructive uppercase">
                  {errors.url.message}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="category"
                className="text-[10px] font-black uppercase tracking-widest"
              >
                Sector
              </Label>
              <Select onValueChange={(val) => setValue("category", val as any)}>
                <SelectTrigger className="h-12 border-2 border-black font-bold uppercase">
                  <SelectValue placeholder="SELECT CATEGORY" />
                </SelectTrigger>
                <SelectContent className="border-2 border-black">
                  {[
                    "Tech",
                    "Courses",
                    "News",
                    "Tools",
                    "Design",
                    "Career",
                    "AI",
                    "Other",
                  ].map((cat) => (
                    <SelectItem
                      key={cat}
                      value={cat}
                      className="font-bold uppercase text-xs"
                    >
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-[10px] font-black text-destructive uppercase">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest">
                Difficulty Level
              </Label>
              <Select
                defaultValue="BEGINNER"
                onValueChange={(val) => setValue("difficulty", val as any)}
              >
                <SelectTrigger className="h-12 border-2 border-black font-bold uppercase">
                  <SelectValue placeholder="SELECT DIFFICULTY" />
                </SelectTrigger>
                <SelectContent className="border-2 border-black">
                  {DIFFICULTY_LEVELS.map((level) => (
                    <SelectItem
                      key={level}
                      value={level}
                      className="font-bold uppercase text-xs"
                    >
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.difficulty && (
                <p className="text-[10px] font-black text-destructive uppercase">
                  {errors.difficulty.message}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="description"
                className="text-[10px] font-black uppercase tracking-widest"
              >
                Brief Intelligence
              </Label>
              <Textarea
                id="description"
                placeholder="WHAT MAKES THIS SIGNAL VALUABLE?"
                className="min-h-[120px] resize-none border-2 border-black font-bold uppercase p-4"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-[10px] font-black text-destructive uppercase">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="tags"
                className="text-[10px] font-black uppercase tracking-widest"
              >
                Identifiers (COMMA SEPARATED)
              </Label>
              <Input
                id="tags"
                placeholder="REACT, HOOKS, PERFORMANCE"
                className="h-12 border-2 border-black font-bold uppercase"
                {...register("tags")}
              />
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="thumbnail"
                className="text-[10px] font-black uppercase tracking-widest"
              >
                Visual Cover URL (Optional)
              </Label>
              <Input
                id="thumbnail"
                placeholder="HTTPS://IMAGE-HOST.COM/..."
                className="h-12 border-2 border-black font-bold"
                {...register("thumbnail")}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-16 text-xl font-black uppercase tracking-widest shadow-neo"
              disabled={isSubmitting}
            >
              {isSubmitting ? "TRANSMITTING..." : "INITIALIZE BROADCAST"}
            </Button>
            <p className="text-center text-[10px] font-black uppercase tracking-widest text-foreground/50">
              BY BROADCASTING, YOU AGREE TO COLLECTIVE QUALITY STANDARDS.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
