export interface Message {
  userId: number;
  text: string;
  parentId?: number;
  homepage?: string;
  fileUrl?: string;
}
export interface CommentMessageResponse {
  pattern: string;
  data: {
    message: Message;
  };
}
