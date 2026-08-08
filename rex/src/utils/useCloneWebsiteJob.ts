import { useEffect, useState } from 'react';
import {
  getCloneWebsiteJob,
  resumeCloneWebsiteJob,
  subscribeCloneWebsiteJob,
  type CloneWebsiteJob,
} from './cloneWebsiteJob';

export function useCloneWebsiteJob(): CloneWebsiteJob | null {
  const [job, setJob] = useState<CloneWebsiteJob | null>(() => getCloneWebsiteJob());

  useEffect(() => {
    resumeCloneWebsiteJob();
    return subscribeCloneWebsiteJob(setJob);
  }, []);

  return job;
}
