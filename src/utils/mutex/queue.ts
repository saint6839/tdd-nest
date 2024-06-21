import { Mutex } from './mutex';

export class Queue {
  private tasks: (() => Promise<void>)[] = [];
  private mutex = new Mutex();

  async addTask(task: () => Promise<void>) {
    // 작업을 큐에 추가
    this.tasks.push(task);

    // 큐가 비어있지 않으면 작업을 처리
    if (this.tasks.length === 1) {
      await this.runTasks();
    }
  }

  private async runTasks() {
    while (this.tasks.length > 0) {
      const task = this.tasks[0];
      const unlock = await this.mutex.lock();

      try {
        await task();
      } finally {
        // 작업이 끝난 후 큐에서 제거하고 lock 해제
        this.tasks.shift();
        unlock();
      }
    }
  }
}
