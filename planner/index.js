// Minimal planner for Buddy v2 MVP
export function createPlanner(memory){
  const queue = [];
  return {
    enqueue(task){ queue.push(task); },
    dequeue(){ return queue.shift(); }
  };
}
