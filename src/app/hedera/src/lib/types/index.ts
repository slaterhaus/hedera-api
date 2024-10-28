export interface UserData {}
export interface Credentials {}


export class CreateChildTopicDto {
  memo?: string;
}

export interface TopicResponseDto {
  topicId: string;
  parentTopicId: string;
  memo?: string;
  timestamp: string;
  status: string;
}

export interface ChildTopic {
  childTopicId: string;
  parentTopicId: string;
  memo: string;
  createdAt: string;
  type: string;
}

export interface ChildTopicsResponse {
  topics: ChildTopic[];
  count: number;
}
export interface MirrorNodeMessage {
  consensus_timestamp: string;
  message: string;
  topic_id: string;
  sequence_number: number;
  running_hash: string;
  running_hash_version: number;
}