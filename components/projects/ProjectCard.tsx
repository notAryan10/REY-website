"use client";

import React, { useCallback } from "react";
import { useSession } from "next-auth/react";
import { 
  Gamepad2, User, Heart, MessageSquare, Send, 
  CornerDownRight, Loader2, ChevronDown, ChevronUp,
  ShieldCheck, RefreshCw, ExternalLink, Cpu
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { motion, AnimatePresence } from "framer-motion";
import { IProject } from "@/types";

interface ProjectCardProps {
  project: IProject;
}

interface Comment {
  _id: string;
  content: string;
  parentId: string | null;
  createdAt: string | Date;
  userId: {
    name: string;
    role: string;
  };
}

export const ProjectCard = ({ project: initialProject }: ProjectCardProps) => {
  const { data: session, status } = useSession();
  const [project, setProject] = React.useState<IProject>(initialProject);
  const [isLiked, setIsLiked] = React.useState(
    initialProject.likes?.includes(session?.user?.id as string) || false
  );
  const [showComments, setShowComments] = React.useState(false);
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = React.useState(false);
  const [newComment, setNewComment] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isResyncing, setIsResyncing] = React.useState(false);
  const [replyTo, setReplyTo] = React.useState<string | null>(null);
  const [replyContent, setReplyContent] = React.useState("");

  const isOwner = session?.user?.id === (project.uploadedBy as any)?._id || session?.user?.id === (project.uploadedBy as any);

  const creatorName = (project.uploadedBy as any)?.name || "Architect";
  const creatorRole = (project.uploadedBy as any)?.role || "Member";

  const fetchComments = useCallback(async () => {
    setLoadingComments(true);
    try {
      const res = await fetch(`/api/projects/${project._id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch {
      console.error("Failed to fetch comments");
    } finally {
      setLoadingComments(false);
    }
  }, [project._id]);

  React.useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, fetchComments]);

  const handleLike = async () => {
    if (status !== "authenticated" || !session?.user?.id) return alert("Authentication required to signal appreciation.");
    
    const userId = session.user.id;
    const previousIsLiked = isLiked;
    const previousLikes = [...project.likes];
    
    setIsLiked(!isLiked);
    setProject({
      ...project,
      likes: !isLiked 
        ? [...project.likes, userId]
        : project.likes.filter((id: string) => id !== userId)
    });

    try {
      const res = await fetch(`/api/projects/${project._id}/like`, { method: "POST" });
      if (!res.ok) throw new Error();
    } catch {
      setIsLiked(previousIsLiked);
      setProject({ ...project, likes: previousLikes }); 
    }
  };

  const handleResync = async () => {
    setIsResyncing(true);
    try {
      const res = await fetch(`/api/projects/resync/${project._id}`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
      }
    } catch (err) {
      console.error("Resync failed:", err);
    } finally {
      setIsResyncing(false);
    }
  };

  const handlePostComment = async (parentId: string | null = null) => {
    const content = parentId ? replyContent : newComment;
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${project._id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, parentId }),
      });

      if (res.ok) {
        const savedComment = await res.json();
        setComments([...comments, savedComment]);
        if (parentId) {
          setReplyTo(null);
          setReplyContent("");
        } else {
          setNewComment("");
        }
      }
    } catch {
      console.error("Comment failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCommentThread = (parentId: string | null = null, depth = 0): React.ReactNode => {
    const filtered = comments.filter(c => c.parentId === parentId);
    if (filtered.length === 0) return null;

    return filtered.map(comment => (
      <div key={comment._id} className={`space-y-4 ${depth > 0 ? "ml-6 border-l-2 border-border/30 pl-4 mt-4" : "mt-6"}`}>
        <div className="bg-zinc-900/50 p-4 border border-border/20 rounded shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center">
                <User size={10} className="text-text-secondary" />
              </div>
              <span className="text-[10px] text-white font-pixel uppercase tracking-tighter">
                {comment.userId?.name || "Architect"}
              </span>
              <Badge variant="stone" className="text-[6px] py-0 px-1 opacity-50 uppercase font-pixel">
                {comment.userId?.role || "Member"}
              </Badge>
            </div>
            <span className="text-[8px] font-pixel text-text-secondary uppercase opacity-40">
              {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          
          <p className="text-sm text-text-secondary font-sans leading-relaxed">
            {comment.content}
          </p>

          <div className="mt-3">
             <button 
               onClick={() => setReplyTo(replyTo === comment._id ? null : comment._id)}
               className="text-[8px] font-pixel text-sky uppercase hover:text-white transition-colors flex items-center gap-1"
             >
               <CornerDownRight size={10} /> {replyTo === comment._id ? "Discard Signal" : "Reply to Signal"}
             </button>
          </div>

          {replyTo === comment._id && (
            <div className="mt-4 flex gap-2">
              <input 
                autoFocus
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Transmitting response..."
                className="flex-1 bg-background border border-sky/30 p-2 text-[10px] font-pixel text-white focus:border-sky outline-none transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handlePostComment(comment._id)}
              />
              <Button size="sm" variant="sky" className="h-full px-4" onClick={() => handlePostComment(comment._id)}>
                <Send size={12} />
              </Button>
            </div>
          )}
        </div>
        {renderCommentThread(comment._id, depth + 1)}
      </div>
    ));
  };

  return (
    <Card 
      accent={project.accent} 
      className="group hover:bg-stone/10 transition-all duration-500 flex flex-col h-full overflow-hidden"
    >
      {/* Visual Header / Cover Image */}
      <div className="relative h-48 -mx-6 -mt-6 mb-6 overflow-hidden bg-black">
        {project.coverImage ? (
          <motion.img 
            src={project.coverImage} 
            alt={project.title}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-stone/20">
            <Gamepad2 className="w-12 h-12 text-white/10 group-hover:text-white/20 transition-colors" />
          </div>
        )}
        
        {/* Badges Overlay */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <Badge variant={project.accent} className="shadow-lg backdrop-blur-md">
            {project.tag}
          </Badge>
          {project.verified && (
            <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-grass/30 px-2 py-1 rounded text-[7px] font-pixel text-grass uppercase">
              <ShieldCheck size={10} /> Verified Build
            </div>
          )}
        </div>

        {project.engine && (
          <div className="absolute bottom-4 left-4">
             <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded text-[7px] font-pixel text-white/80 uppercase">
                <Cpu size={10} className="text-sky" /> {project.engine}
             </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
      </div>

      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-start">
           <h4 className="text-xl uppercase group-hover:text-white transition-colors leading-tight font-pixel tracking-tighter">
            {project.title}
          </h4>
          <span className="text-[8px] font-pixel text-text-secondary uppercase opacity-50 whitespace-nowrap ml-2">
            {new Date(project.createdAt).toLocaleDateString()}
          </span>
        </div>
        
        <p className="text-text-secondary text-sm font-sans line-clamp-3 mb-4 leading-relaxed">
          {project.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-border/30">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center border border-white/5">
              <User size={12} className="text-text-secondary" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-white font-pixel uppercase tracking-tighter leading-none">
                {creatorName}
              </span>
              <span className="text-[8px] text-grass font-pixel uppercase opacity-70">
                {creatorRole}
              </span>
            </div>
          </div>

          {project.source === "itch" && (
            <div className="flex items-center gap-1 opacity-40 group-hover:opacity-80 transition-opacity">
               <Gamepad2 size={12} className="text-white" />
               <span className="text-[7px] font-pixel text-white">ITCH.IO_SYNC</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <Button 
          variant={project.accent} 
          size="sm" 
          className="w-full font-pixel text-[10px] tracking-widest h-10 group-hover:scale-[1.01] transition-transform"
          onClick={() => window.open(project.itchIoUrl, "_blank")}
        >
          <ExternalLink className="w-3.5 h-3.5 mr-2" /> 
          {project.source === "itch" ? "Play on Itch.io" : "View Deployment"}
        </Button>

        {isOwner && project.source === "itch" && (
          <button 
            onClick={handleResync}
            disabled={isResyncing}
            className="flex items-center justify-center gap-2 py-2 text-[8px] font-pixel text-text-secondary hover:text-white transition-colors border border-dashed border-border/40 hover:border-border"
          >
            {isResyncing ? (
              <Loader2 size={10} className="animate-spin" />
            ) : (
              <RefreshCw size={10} className={project.syncStatus === "outdated" ? "text-lava" : ""} />
            )}
            {project.syncStatus === "outdated" ? "UPDATE_SNAPSHOT" : "SYNC_METADATA"}
          </button>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-1 group/btn transition-colors ${isLiked ? "text-lava scale-110" : "text-text-secondary hover:text-lava"}`}
          >
            <motion.div whileTap={{ scale: 1.5 }}>
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            </motion.div>
            <span className="text-[10px] font-pixel">{project.likes?.length || 0}</span>
          </button>

          <button 
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1 group/btn transition-colors ${showComments ? "text-sky" : "text-text-secondary hover:text-sky"}`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-[10px] font-pixel">{comments.length > 0 ? comments.length : (project.commentCount || 0)}</span>
            {showComments ? <ChevronUp size={10} className="ml-1" /> : <ChevronDown size={10} className="ml-1" />}
          </button>
        </div>
        
        {project.views !== undefined && (
          <span className="text-[8px] font-pixel text-text-secondary opacity-30">
            {project.views} ARCHIVE_VIEWS
          </span>
        )}
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 overflow-hidden border-t border-border/20 pt-4"
          >
            <div className="space-y-4">
              {status === "authenticated" ? (
                <div className="flex gap-2">
                  <input 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Drop a transmission..."
                    className="flex-1 bg-background border-2 border-border p-3 text-[10px] font-pixel text-white focus:border-sky outline-none transition-colors"
                  />
                  <Button 
                    variant="sky" 
                    className="px-6" 
                    onClick={() => handlePostComment()}
                    disabled={isSubmitting || !newComment.trim()}
                  >
                    {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={14} />}
                  </Button>
                </div>
              ) : (
                <p className="text-[8px] font-pixel text-text-secondary text-center py-2 bg-stone/5 border border-dashed border-border/20">
                  Authenticate to connect to the signal.
                </p>
              )}

              <div className="max-h-[300px] overflow-y-auto px-1 custom-scrollbar">
                {loadingComments ? (
                  <div className="flex justify-center py-8">
                    <Loader2 size={24} className="animate-spin text-sky" />
                  </div>
                ) : (
                  renderCommentThread() || (
                    <p className="text-[10px] font-pixel text-text-secondary text-center py-8 opacity-50 uppercase">
                      Silence in the sector...
                    </p>
                  )
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
