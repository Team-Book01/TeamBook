import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Bookmark,
  MessageCircle,
  Eye,
  MoreVertical,
  CornerDownRight,
  ThumbsUp,
  ChevronRight,
  TrendingUp,
  Edit3,
  Trash2,
  AlertTriangle,
  Calendar,
} from "lucide-react";

import type { Comment, Reply } from "./detailData";
import {
  BOOK_COVER,
  POST_IMAGE_1,
  POST_IMAGE_2,
  AVATAR_1,
  MY_AVATAR,
  HOT_POSTS,
  COMMENTS,
} from "./detailData";

/* ─────────────── 공통 컴포넌트 ─────────────── */
function CategoryBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        backgroundColor: color + "18",
        color,
        fontSize: 12,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 20,
        letterSpacing: "0.3px",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

/* ─────────────── 게시글 메타 ─────────────── */
function PostMeta() {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div>
      {/* 카테고리 & 도서 정보 */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <CategoryBadge label="책 추천" color="#7C3AED" />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img
            src={BOOK_COVER}
            alt="아몬드 표지"
            style={{
              height: 40,
              width: 27,
              objectFit: "cover",
              borderRadius: 4,
              boxShadow: "0 1px 6px rgba(0,0,0,0.18)",
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1A1A" }}>아몬드</span>
          <span style={{ fontSize: 13, color: "#CCCCCC" }}>·</span>
          <span style={{ fontSize: 13, color: "#888888" }}>손원평</span>
        </div>
      </div>

      {/* 제목 */}
      <h1
        style={{
          fontSize: 27,
          fontWeight: 700,
          color: "#1A1A1A",
          lineHeight: 1.45,
          letterSpacing: "-0.6px",
          marginBottom: 22,
        }}
      >
        감정을 잘 못 느끼는 주인공,
        <br />
        그런데 왜 이렇게 감동적일까
      </h1>

      {/* 작성자 + 날짜/조회수 한 줄 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* 좌: 작성자 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src={AVATAR_1}
            alt="작성자"
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #F0F4F2",
            }}
          />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A" }}>책방주인장</span>
        </div>

        {/* 우: 날짜 + 조회수 + 더보기 */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Calendar size={13} color="#AAAAAA" />
            <span style={{ fontSize: 13, color: "#AAAAAA" }}>2025.07.04 12:08</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Eye size={13} color="#AAAAAA" />
            <span style={{ fontSize: 13, color: "#AAAAAA" }}>1,284</span>
          </div>
          {/* 더보기 */}
          <div ref={menuRef} style={{ position: "relative" }}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "5px 4px",
                borderRadius: 6,
                color: "#BBBBBB",
                display: "flex",
                alignItems: "center",
              }}
            >
              <MoreVertical size={17} />
            </button>
            {showMenu && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 4px)",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid rgba(0,0,0,0.09)",
                  borderRadius: 10,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                  overflow: "hidden",
                  zIndex: 20,
                  minWidth: 110,
                }}
              >
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    width: "100%",
                    padding: "10px 16px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    color: "#1A1A1A",
                    fontFamily: "Pretendard, sans-serif",
                  }}
                >
                  <Edit3 size={13} /> 수정
                </button>
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    width: "100%",
                    padding: "10px 16px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    color: "#D4183D",
                    fontFamily: "Pretendard, sans-serif",
                  }}
                >
                  <Trash2 size={13} /> 삭제
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <hr
        style={{
          border: "none",
          borderTop: "1px solid rgba(0,0,0,0.07)",
          margin: "20px 0 0",
        }}
      />
    </div>
  );
}

/* ─────────────── 게시글 본문 ─────────────── */
function PostBody() {
  return (
    <div style={{ lineHeight: 1.85, color: "#2C2C2C" }}>
      <p style={{ fontSize: 17, marginBottom: 28 }}>
        손원평 작가의 《아몬드》를 처음 집어 들었을 때, 솔직히 말하면 큰 기대 없이 펼쳤습니다.
        '감정을 못 느끼는 아이'라는 설정이 자칫하면 지나치게 작위적으로 느껴질 수 있겠다 싶었거든요.
        그런데 단 몇 페이지 만에 그 편견이 완전히 무너졌습니다. 윤재의 눈을 통해 세상을 바라보는 순간,
        오히려 제가 얼마나 많은 감정의 소음 속에 살고 있었는지 새삼스럽게 깨달았습니다.
      </p>

      <img
        src={POST_IMAGE_1}
        alt="독서 인증 사진"
        style={{
          width: "100%",
          borderRadius: 12,
          objectFit: "cover",
          height: 360,
          display: "block",
          marginBottom: 32,
          backgroundColor: "#EEE",
        }}
      />

      <p style={{ fontSize: 17, marginBottom: 28 }}>
        이 소설의 핵심은 단순히 '감정 없는 소년의 성장'이 아닙니다. 주인공 윤재는 '감정표현불능증(알렉시티미아)'을
        갖고 태어났지만, 그렇다고 해서 그가 세상과 완전히 단절된 존재인 것은 아닙니다. 오히려 그가 감정이 없기
        때문에, 더 담담하고 더 세밀하게 세상을 관찰합니다. 침묵이 그 자체로 하나의 언어가 되는 것입니다.
      </p>

      <p style={{ fontSize: 17, marginBottom: 28 }}>
        작가는 윤재 곁에 곤이라는 캐릭터를 배치함으로써 이 소설에 숨결을 불어넣습니다. 폭력적이고 거칠어 보이지만
        사실은 누구보다 상처받은 아이, 곤이. 감정의 과잉과 감정의 부재, 이 두 극단이 서로를 바라보며 어색하게
        연결되는 과정이 이 책의 가장 아름다운 부분입니다.
      </p>

      <div style={{ marginBottom: 32 }}>
        <img
          src={POST_IMAGE_2}
          alt="독서 노트 인증"
          style={{
            width: "56%",
            borderRadius: 12,
            objectFit: "cover",
            display: "block",
            margin: "0 auto",
            maxHeight: 500,
            backgroundColor: "#EEE",
          }}
        />
        <p style={{ textAlign: "center", fontSize: 13, color: "#AAAAAA", marginTop: 10 }}>
          읽으면서 계속 밑줄을 그어서 책이 이 지경이 됐습니다 😅
        </p>
      </div>

      <p style={{ fontSize: 17 }}>
        마지막 페이지를 덮고 나서 한동안 그냥 멍하니 앉아 있었습니다. 이 소설이 감동적인 이유는 결국 윤재가
        감정을 '배우기' 때문이 아닙니다. 그가 감정이 없어도, 자신만의 방식으로 사람과 연결될 수 있다는 것을
        조심스럽게 증명해 가기 때문입니다. 아직 안 읽으신 분들께 진심으로 권합니다.
      </p>
    </div>
  );
}

/* ─────────────── 게시글 액션 버튼 ─────────────── */
function PostActions() {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(87);
  const [saveCount, setSaveCount] = useState(34);
  const [showReport, setShowReport] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (reportRef.current && !reportRef.current.contains(e.target as Node)) {
        setShowReport(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      style={{
        marginTop: 48,
        paddingTop: 32,
        borderTop: "1px solid rgba(0,0,0,0.07)",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 10,
      }}
    >
      {/* 추천 버튼 */}
      <button
        onClick={() => {
          setLiked(!liked);
          setLikeCount(liked ? likeCount - 1 : likeCount + 1);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "10px 22px",
          borderRadius: 50,
          border: `1.5px solid ${liked ? "#2E7D6B" : "rgba(0,0,0,0.12)"}`,
          backgroundColor: liked ? "#E8F5F1" : "#FFFFFF",
          cursor: "pointer",
          transition: "all 0.18s",
          fontFamily: "Pretendard, sans-serif",
        }}
      >
        <Heart size={17} color={liked ? "#2E7D6B" : "#888"} fill={liked ? "#2E7D6B" : "none"} />
        <span style={{ fontSize: 14, fontWeight: 600, color: liked ? "#2E7D6B" : "#888" }}>
          추천 {likeCount}
        </span>
      </button>

      {/* 스크랩 버튼 */}
      <button
        onClick={() => {
          setSaved(!saved);
          setSaveCount(saved ? saveCount - 1 : saveCount + 1);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "10px 22px",
          borderRadius: 50,
          border: `1.5px solid ${saved ? "#1E4A38" : "rgba(0,0,0,0.12)"}`,
          backgroundColor: saved ? "#F0F4F2" : "#FFFFFF",
          cursor: "pointer",
          transition: "all 0.18s",
          fontFamily: "Pretendard, sans-serif",
        }}
      >
        <Bookmark size={17} color={saved ? "#1E4A38" : "#888"} fill={saved ? "#1E4A38" : "none"} />
        <span style={{ fontSize: 14, fontWeight: 600, color: saved ? "#1E4A38" : "#888" }}>
          스크랩 {saveCount}
        </span>
      </button>

      {/* 신고하기 (더보기 방식) */}
      <div ref={reportRef} style={{ position: "relative" }}>
        <button
          onClick={() => setShowReport(!showReport)}
          style={{
            background: "none",
            border: "1.5px solid rgba(0,0,0,0.1)",
            borderRadius: 50,
            padding: "10px 14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            color: "#BBBBBB",
          }}
        >
          <MoreVertical size={16} />
        </button>
        {showReport && (
          <div
            style={{
              position: "absolute",
              right: 0,
              bottom: "calc(100% + 6px)",
              backgroundColor: "#FFFFFF",
              border: "1px solid rgba(0,0,0,0.09)",
              borderRadius: 10,
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              overflow: "hidden",
              zIndex: 20,
              minWidth: 130,
            }}
          >
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
                padding: "11px 16px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                color: "#D4183D",
                fontFamily: "Pretendard, sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              <AlertTriangle size={13} color="#D4183D" /> 🚨 신고하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────── 댓글 입력창 ─────────────── */
function CommentInput() {
  const [text, setText] = useState("");
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: "flex", gap: 12 }}>
        <img
          src={MY_AVATAR}
          alt="내 아바타"
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            objectFit: "cover",
            flexShrink: 0,
            marginTop: 2,
          }}
        />
        <div style={{ flex: 1 }}>
          <textarea
            placeholder="따뜻한 댓글은 작성자에게 큰 힘이 됩니다 :)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{
              width: "100%",
              minHeight: 92,
              padding: "14px 16px",
              border: "1.5px solid rgba(0,0,0,0.1)",
              borderRadius: 10,
              fontSize: 15,
              lineHeight: 1.65,
              resize: "vertical",
              fontFamily: "Pretendard, sans-serif",
              color: "#1A1A1A",
              outline: "none",
              boxSizing: "border-box",
              backgroundColor: "#FAFAFA",
              transition: "border-color 0.15s, background-color 0.15s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#2E7D6B";
              e.currentTarget.style.backgroundColor = "#FFFFFF";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)";
              e.currentTarget.style.backgroundColor = "#FAFAFA";
            }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button
              style={{
                backgroundColor: text.trim() ? "#1E4A38" : "#AAAAAA",
                color: "#FFFFFF",
                padding: "9px 22px",
                borderRadius: 8,
                border: "none",
                fontSize: 14,
                fontWeight: 600,
                cursor: text.trim() ? "pointer" : "default",
                fontFamily: "Pretendard, sans-serif",
                transition: "background-color 0.15s",
              }}
            >
              등록
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── 대댓글 입력창 ─────────────── */
function ReplyInput({ onCancel }: { onCancel: () => void }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        marginTop: 12,
        marginBottom: 4,
        paddingLeft: 52,
      }}
    >
      <img
        src={MY_AVATAR}
        alt="내 아바타"
        style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", flexShrink: 0, marginTop: 2 }}
      />
      <div style={{ flex: 1 }}>
        <textarea
          placeholder="답글을 입력하세요..."
          autoFocus
          style={{
            width: "100%",
            minHeight: 74,
            padding: "10px 14px",
            border: "1.5px solid #2E7D6B",
            borderRadius: 8,
            fontSize: 14,
            lineHeight: 1.6,
            resize: "none",
            fontFamily: "Pretendard, sans-serif",
            color: "#1A1A1A",
            outline: "none",
            boxSizing: "border-box",
            backgroundColor: "#FFFFFF",
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
          <button
            onClick={onCancel}
            style={{
              padding: "7px 16px",
              borderRadius: 7,
              border: "1.5px solid rgba(0,0,0,0.1)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              background: "#FFFFFF",
              color: "#888888",
              fontFamily: "Pretendard, sans-serif",
            }}
          >
            취소
          </button>
          <button
            style={{
              backgroundColor: "#1E4A38",
              color: "#FFFFFF",
              padding: "7px 16px",
              borderRadius: 7,
              border: "none",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "Pretendard, sans-serif",
            }}
          >
            등록
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── 대댓글 아이템 ─────────────── */
function ReplyItem({ reply }: { reply: Reply }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(reply.likes);

  return (
    <div
      style={{
        paddingLeft: 20,
        paddingTop: 10,
        paddingBottom: 2,
        borderTop: "1px solid rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          backgroundColor: "#F7FAF9",
          border: "1px solid rgba(46,125,107,0.12)",
          borderRadius: 10,
          padding: "14px 16px",
        }}
      >
        {/* 박스 내부: ↳ + 아바타 + 닉네임 한 줄 */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <CornerDownRight size={13} color="#2E7D6B" strokeWidth={2} style={{ flexShrink: 0 }} />
          <img
            src={reply.avatar}
            alt={reply.author}
            style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
          />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1A1A" }}>{reply.author}</span>
          <span style={{ fontSize: 12, color: "#BBBBBB" }}>{reply.time}</span>
        </div>

        {/* 본문: 멘션 태그 포함 */}
        <p style={{ fontSize: 14, color: "#3A3A3A", lineHeight: 1.72, margin: "0 0 10px", paddingLeft: 21 }}>
          {reply.mentionTo && (
            <span style={{ color: "#2E7D6B", fontWeight: 700, marginRight: 6 }}>
              @{reply.mentionTo}
            </span>
          )}
          {reply.content}
        </p>

        {/* 액션 */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingLeft: 21 }}>
          <button
            onClick={() => {
              setLiked(!liked);
              setLikeCount(liked ? likeCount - 1 : likeCount + 1);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: 0,
            }}
          >
            <ThumbsUp size={12} color={liked ? "#2E7D6B" : "#BBBBBB"} fill={liked ? "#2E7D6B" : "none"} />
            <span style={{ fontSize: 12, color: liked ? "#2E7D6B" : "#BBBBBB" }}>{likeCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── 원댓글 아이템 ─────────────── */
function CommentItem({ comment }: { comment: Comment }) {
  const [showReply, setShowReply] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likes);

  return (
    <div
      style={{
        paddingTop: 24,
        paddingBottom: 8,
        borderTop: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      {/* 원댓글 */}
      <div style={{ display: "flex", gap: 12 }}>
        <img
          src={comment.avatar}
          alt={comment.author}
          style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A" }}>{comment.author}</span>
            <span style={{ fontSize: 12, color: "#BBBBBB" }}>{comment.time}</span>
          </div>
          <p style={{ fontSize: 15, color: "#3A3A3A", lineHeight: 1.75, margin: "0 0 12px" }}>
            {comment.content}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              onClick={() => setShowReply(!showReply)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                color: "#888888",
                fontFamily: "Pretendard, sans-serif",
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: 0,
              }}
            >
              <MessageCircle size={13} color="#AAAAAA" />
              답글 달기
            </button>
            <button
              onClick={() => {
                setLiked(!liked);
                setLikeCount(liked ? likeCount - 1 : likeCount + 1);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: 0,
              }}
            >
              <ThumbsUp size={13} color={liked ? "#2E7D6B" : "#CCCCCC"} fill={liked ? "#2E7D6B" : "none"} />
              <span style={{ fontSize: 13, color: liked ? "#2E7D6B" : "#BBBBBB" }}>{likeCount}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 답글 입력창 */}
      {showReply && <ReplyInput onCancel={() => setShowReply(false)} />}

      {/* 대댓글 목록 */}
      {comment.replies.length > 0 && (
        <div style={{ marginTop: 8, marginBottom: 8 }}>
          {comment.replies.map((reply) => (
            <ReplyItem key={reply.id} reply={reply} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────── 댓글 섹션 ─────────────── */
function CommentSection() {
  return (
    <div style={{ marginTop: 48, paddingTop: 32, borderTop: "2px solid rgba(0,0,0,0.07)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
        <MessageCircle size={18} color="#1E4A38" />
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A1A1A", margin: 0 }}>댓글 45개</h2>
      </div>
      <CommentInput />
      <div>
        {COMMENTS.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}

/* ─────────────── 프로필 카드 ─────────────── */
function ProfileCard() {
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        border: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        marginBottom: 20,
        overflow: "hidden",
      }}
    >
      {/* 딥 포레스트 그린 헤더 배너 */}
      <div
        style={{
          height: 52,
          backgroundColor: "#1E4A38",
          backgroundImage:
            "radial-gradient(circle at 70% 40%, rgba(46,125,107,0.55) 0%, transparent 60%)",
        }}
      />

      {/* 아바타 (헤더에 걸쳐 오버랩) */}
      <div style={{ padding: "0 16px 16px", position: "relative" }}>
        <img
          src={MY_AVATAR}
          alt="내 프로필"
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            objectFit: "cover",
            border: "3px solid #FFFFFF",
            boxShadow: "0 2px 6px rgba(0,0,0,0.14)",
            marginTop: -22,
            display: "block",
          }}
        />
        <div style={{ marginTop: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#1A1A1A", display: "block", marginBottom: 2 }}>
            책방주인장
          </span>
          <span style={{ fontSize: 11, color: "#AAAAAA" }}>열정적인 독서인</span>
        </div>

        {/* 통계: 내가 쓴 글 / 스크랩한 글 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1,
            backgroundColor: "rgba(0,0,0,0.06)",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          {[
            { label: "내가 쓴 글", value: "12" },
            { label: "스크랩한 글", value: "34" },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{ backgroundColor: "#FFFFFF", padding: "11px 0", textAlign: "center" }}
            >
              <div style={{ fontSize: 17, fontWeight: 700, color: "#1E4A38" }}>{value}</div>
              <div style={{ fontSize: 11, color: "#AAAAAA", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── 인기글 위젯 ─────────────── */
function HotPostsWidget() {
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 24,
        border: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <TrendingUp size={16} color="#1E4A38" />
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1A1A1A", margin: 0 }}>이번 주 핫한 글</h3>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {HOT_POSTS.map((post, idx) => (
          <a
            key={post.id}
            href="#"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "12px 0",
              borderBottom: idx < HOT_POSTS.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
              textDecoration: "none",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.65")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
          >
            <span
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: idx < 3 ? "#1E4A38" : "#CCCCCC",
                width: 20,
                flexShrink: 0,
                lineHeight: 1,
                paddingTop: 1,
              }}
            >
              {idx + 1}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#2C2C2C",
                  margin: "0 0 4px",
                  lineHeight: 1.5,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {post.title}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CategoryBadge label={post.category} color="#2E7D6B" />
                <span style={{ fontSize: 11, color: "#AAAAAA", display: "flex", alignItems: "center", gap: 3 }}>
                  <Eye size={10} /> {post.views.toLocaleString()}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
      <a
        href="#"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          marginTop: 16,
          padding: "9px 0",
          backgroundColor: "#F5F5F5",
          borderRadius: 8,
          fontSize: 13,
          color: "#888888",
          textDecoration: "none",
          fontWeight: 500,
          transition: "background-color 0.15s",
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#EBEBEB")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#F5F5F5")}
      >
        전체 인기글 보기 <ChevronRight size={13} />
      </a>
    </div>
  );
}

/* ─────────────── 메인 페이지 ─────────────── */
export default function CommunityDetailPage() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "Pretendard, -apple-system, sans-serif", backgroundColor: "#F9F9F9", minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: 1300,
          margin: "0 auto",
          paddingTop: 32,
          paddingBottom: 80,
          paddingLeft: 24,
          paddingRight: 24,
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 28,
          alignItems: "start",
        }}
      >
        {/* 좌: 게시글 + 댓글 */}
        <main>
          {/* 목록으로 돌아가기 */}
          <button
            onClick={() => navigate("/community")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              marginBottom: 16,
              fontSize: 14,
              fontWeight: 500,
              color: "#888888",
              fontFamily: "Pretendard, sans-serif",
            }}
          >
            <ChevronRight size={15} style={{ transform: "rotate(180deg)" }} /> 목록으로
          </button>

          <article
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 14,
              padding: "40px 52px",
              border: "1px solid rgba(0,0,0,0.07)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
              marginBottom: 20,
            }}
          >
            <PostMeta />
            <div style={{ paddingTop: 36 }}>
              <PostBody />
            </div>
            <PostActions />
          </article>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 14,
              padding: "36px 52px",
              border: "1px solid rgba(0,0,0,0.07)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
            }}
          >
            <CommentSection />
          </div>
        </main>

        {/* 우: 사이드바 */}
        <aside style={{ position: "sticky", top: 88 }}>
          <ProfileCard />
          <HotPostsWidget />
        </aside>
      </div>
    </div>
  );
}
