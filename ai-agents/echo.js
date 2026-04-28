// Simple EchoAgent for MVP
export class EchoAgent {
  async execute(input, memory){
    // Echo back the input with a simple augmentation
    const output = { echoed: input, timestamp: Date.now() };
    // store optional metadata
    if(memory){ await memory.set('lastAgentOutput', output); }
    return output;
  }
}
