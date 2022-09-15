-- public."Bloggers" definition
-- Drop table
-- DROP TABLE public."Bloggers";

CREATE TABLE public."Bloggers" (
	id varchar NOT NULL DEFAULT gen_random_uuid(),
	"name" varchar NOT NULL,
	"youtubeUrl" varchar NOT NULL,
	CONSTRAINT "Bloggers_pkey" PRIMARY KEY (id)
);

-- public."CommentLikes" definition
-- Drop table
-- DROP TABLE public."CommentLikes";
CREATE TABLE public."CommentLikes" (
	"addedAt" timestamptz NOT NULL,
	"likeStatus" public."like_status" NOT NULL,
	"userId" uuid NOT NULL,
	"commentId" uuid NOT NULL,
	CONSTRAINT "CommentLikes_commentId_userId_key" UNIQUE ("commentId", "userId"),
	CONSTRAINT "CommentLikes_pkey" PRIMARY KEY ("userId", "commentId")
);



-- public."Comments" definition
-- Drop table
-- DROP TABLE public."Comments";
CREATE TABLE public."Comments" (
	id uuid NOT NULL DEFAULT gen_random_uuid(),
	"content" text NOT NULL,
	"addedAt" timestamptz NOT NULL,
	"userId" uuid NOT NULL,
	"postId" uuid NOT NULL,
	CONSTRAINT "Comments_pkey" PRIMARY KEY (id)
);
-- public."Comments" foreign keys
ALTER TABLE public."Comments" 
  ADD CONSTRAINT fk_post_id 
  FOREIGN KEY ("postId") 
  REFERENCES public."Posts"(id);
ALTER TABLE public."Comments" 
  ADD CONSTRAINT fk_user_id 
  FOREIGN KEY ("userId") 
  REFERENCES public."Users"(id);



-- public."PostLikes" definition
-- Drop table
-- DROP TABLE public."PostLikes";
CREATE TABLE public."PostLikes" (
	id uuid NOT NULL DEFAULT gen_random_uuid(),
	"addedAt" timestamptz NOT NULL,
	"likeStatus" public."like_status" NOT NULL,
	"postId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	CONSTRAINT "PostLikes_pkey" PRIMARY KEY (id),
	CONSTRAINT "PostLikes_postId_userId_key" UNIQUE ("postId", "userId")
);

-- public."PostLikes" foreign keys
ALTER TABLE public."PostLikes" 
  ADD CONSTRAINT "fk_postId" 
  FOREIGN KEY ("postId") 
  REFERENCES public."Posts"(id);
ALTER TABLE public."PostLikes" 
  ADD CONSTRAINT "fk_userId" 
  FOREIGN KEY ("userId") 
  REFERENCES public."Users"(id);


-- public."Posts" definition
-- Drop table
-- DROP TABLE public."Posts";
CREATE TABLE public."Posts" (
	id uuid NOT NULL DEFAULT gen_random_uuid(),
	title varchar NOT NULL,
	"shortDescription" varchar NOT NULL,
	"content" varchar NOT NULL,
	"bloggerId" varchar NOT NULL,
	"addedAt" timestamptz NOT NULL,
	CONSTRAINT "Posts_pkey" PRIMARY KEY (id)
);

-- public."Posts" foreign keys
ALTER TABLE public."Posts" 
  ADD CONSTRAINT "fk_bloggerId" 
  FOREIGN KEY ("bloggerId") 
  REFERENCES public."Bloggers"(id);



-- public."Users" definition
-- Drop table
-- DROP TABLE public."Users";
CREATE TABLE public."Users" (
	id uuid NOT NULL DEFAULT gen_random_uuid(),
	"passwordHash" varchar NOT NULL,
	"isConfirmed" bool NOT NULL DEFAULT false,
	"confirmCode" varchar NULL,
	login varchar NOT NULL,
	email varchar NOT NULL,
	CONSTRAINT "Users_pkey" PRIMARY KEY (id)
);