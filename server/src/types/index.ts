export interface ExampleType {
    id: number;
    name: string;
    isActive: boolean;
}

export type ExampleResponse = {
    data: ExampleType[];
    total: number;
};

// --- Types ---
export interface GitlabUser {
  id?: number;
  username?: string;
  public_email?: string;
  name?: string;
  state?: string;
  locked?: boolean;
  avatar_url?: string;
  web_url?: string;
}

export interface GitlabEnvironment {
  id?: number;
  name?: string;
  slug?: string;
  external_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface GitlabDeployable {
  id?: number;
  status?: string;
  stage?: string;
  name?: string;
  ref?: string;
  tag?: boolean;
  coverage?: number | null;
  allow_failure?: boolean;
  created_at?: string;
  started_at?: string | null;
  finished_at?: string | null;
  erased_at?: string | null;
  duration?: number | null;
  queued_duration?: number | null;
  user?: { local_time?: string | null };
  commit?: { web_url?: string };
  pipeline?: { web_url?: string };
  web_url?: string;
  project?: { ci_job_token_scope_enabled?: boolean };
  artifacts?: any[];
  runner?: { status?: string };
  runner_manager?: any;
  artifacts_expire_at?: string | null;
  archived?: boolean;
  tag_list?: string[];
  artifacts_file?: { size?: number };
}

export interface GitlabDeployment {
  id: number;
  iid?: number;
  ref?: string;
  sha?: string;
  created_at?: string;
  updated_at?: string;
  user?: GitlabUser;
  environment?: GitlabEnvironment;
  deployable?: GitlabDeployable;
  status?: string;
}

export interface GitlabCommit {
  id: string;
  short_id?: string;
  created_at: string;
  parent_ids?: string[];
  title?: string;
  message?: string;
  author_name?: string;
  author_email?: string;
  authored_date?: string;
  committer_name?: string;
  committer_email?: string;
  committed_date?: string;
  web_url?: string;
}