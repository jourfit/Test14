import { useState } from 'react'
import { Heart, MessageCircle, Share2, Plus, Camera } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { useAuthStore } from '../../store/authStore'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Textarea } from '../../components/ui/Input'
import { formatRelative, cn } from '../../lib/utils'
import { useToast } from '../../components/ui/Toast'
import type { FeedPost } from '../../types'

export default function FeedPage() {
  const { posts, toggleLike, addPost } = useAppStore()
  const { user } = useAuthStore()
  const { push } = useToast()
  const [newPostOpen, setNewPostOpen] = useState(false)
  const [postText, setPostText] = useState('')
  const [isRealCheckin, setIsRealCheckin] = useState(false)

  const handlePost = () => {
    if (!postText.trim() || !user) return
    addPost({
      userId: user.id,
      authorName: user.displayName,
      authorUsername: user.username,
      authorVerified: user.verified,
      content: postText.trim(),
      type: isRealCheckin ? 'real_checkin' : 'post',
      tags: [],
      likesCount: 0,
      commentsCount: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
    })
    setPostText('')
    setNewPostOpen(false)
    push('Post veröffentlicht')
  }

  return (
    <div className="py-4 max-w-lg mx-auto">
      {/* New post button */}
      <button
        onClick={() => setNewPostOpen(true)}
        className="w-full flex items-center gap-3 p-3 mb-4 card hover:border-white/15 transition-colors"
      >
        <Avatar name={user?.displayName ?? 'U'} size="sm" />
        <span className="text-white/30 text-sm font-body flex-1 text-left">Was trainierst du heute?</span>
        <Plus size={16} className="text-neon" />
      </button>

      {/* Feed */}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onLike={() => {
          toggleLike(post.id)
          if (!post.isLiked) push('Post geliked')
        }} />
      ))}

      {/* Create post modal */}
      <Modal open={newPostOpen} onClose={() => setNewPostOpen(false)} title="Neuer Post">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <Avatar name={user?.displayName ?? 'U'} size="sm" />
            <Textarea
              placeholder="Teile dein Training, deine Gedanken oder dein Ergebnis..."
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              rows={4}
              className="flex-1"
            />
          </div>

          <button
            onClick={() => setIsRealCheckin(!isRealCheckin)}
            className={cn(
              'flex items-center gap-2 p-3 rounded-lg border transition-all',
              isRealCheckin ? 'border-neon/40 bg-neon/06' : 'border-white/08'
            )}
          >
            <Camera size={16} className={isRealCheckin ? 'text-neon' : 'text-white/40'} />
            <span className={cn('font-display text-sm', isRealCheckin ? 'text-neon' : 'text-white/50')}>
              Real Check-in
            </span>
            {isRealCheckin && <span className="ml-auto badge-neon">aktiv</span>}
          </button>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setNewPostOpen(false)} className="flex-1">
              Abbrechen
            </Button>
            <Button
              variant="neon"
              size="sm"
              onClick={handlePost}
              disabled={!postText.trim()}
              className="flex-1"
            >
              Posten
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function PostCard({ post, onLike }: { post: FeedPost; onLike: () => void }) {
  return (
    <Card className="mb-3 overflow-hidden">
      {post.type === 'real_checkin' && (
        <div className="px-4 py-1.5 bg-neon/08 border-b border-neon/15 flex items-center gap-2">
          <Camera size={12} className="text-neon" />
          <span className="text-neon text-[0.65rem] font-bold uppercase tracking-widest">Real Check-in</span>
        </div>
      )}
      <div className="p-4">
        {/* Author row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <Avatar name={post.authorName} size="sm" verified={post.authorVerified} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-sm text-white">{post.authorName}</span>
              </div>
              <span className="text-xs text-white/35">@{post.authorUsername} · {formatRelative(post.createdAt)}</span>
            </div>
          </div>
          {post.type === 'achievement' && <Badge variant="neon">Achievement</Badge>}
        </div>

        {/* Content */}
        <p className="text-sm text-white/85 font-body leading-relaxed mb-3">{post.content}</p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.tags.map((tag) => (
              <span key={tag} className="text-[0.65rem] text-neon/70 font-body">#{tag}</span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-3 border-t border-white/06">
          <button
            onClick={onLike}
            className={cn(
              'flex items-center gap-1.5 text-xs transition-colors',
              post.isLiked ? 'text-neon' : 'text-white/40 hover:text-white/70'
            )}
          >
            <Heart size={15} fill={post.isLiked ? 'currentColor' : 'none'} />
            {post.likesCount}
          </button>
          <button className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors">
            <MessageCircle size={15} />
            {post.commentsCount}
          </button>
          <button className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors ml-auto">
            <Share2 size={15} />
          </button>
        </div>
      </div>
    </Card>
  )
}
