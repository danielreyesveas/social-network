export interface Post {
	identifier: string;
	title: string;
	slug: string;
	body?: string;
	subName: string;
	username: string;
	user: User;
	createdAt: string;
	updatedAt: string;
	sub?: Sub;

	// Virtual fields
	url: string;
	voteScore?: number;
	commentCount?: number;
	userVote?: number;
	userBookmark?: boolean;
}

export interface User {
	username: string;
	email: string;
	bio?: string;
	createdAt: string;
	updatedAt: string;

	// Virtual fields
	imageUrn?: string;
	imageUrl: string;
	url: string;
	postCount?: number;
	followerCount?: number;
}

export interface Sub {
	createdAt: string;
	updatedAt: string;
	name: string;
	title: string;
	description: string;
	imageUrn: string;
	bannerUrn: string;
	username: string;
	user: User;
	posts: Post[];
	members: any[];

	// Virtual fields
	url: string;
	imageUrl: string;
	bannerUrl: string;
	postCount?: number;
	followerCount?: number;
	userFollow?: number;
	followersPreview: any[];
}

export interface Comment {
	identifier: string;
	body: string;
	username: string;
	createdAt: string;
	updatedAt: string;
	post?: Post;

	// virtual fields
	userVote: number;
	voteScore: number;
}

export interface Thread {
	id: string;
	createdAt: string;
	updatedAt: string;
}
