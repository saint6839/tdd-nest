import { Mutex } from './mutex';

describe('Mutex', () => {
  let mutex: Mutex;

  beforeEach(() => {
    mutex = new Mutex();
  });

  it('락을 순차적으로 획득하고 해제해야 한다', async () => {
    const results: string[] = [];

    const task1 = async () => {
      const release = await mutex.lock();
      results.push('task1 락 획득');
      await new Promise(resolve => setTimeout(resolve, 100));
      results.push('task1 락 해제');
      release();
    };

    const task2 = async () => {
      const release = await mutex.lock();
      results.push('task2 락 획득');
      await new Promise(resolve => setTimeout(resolve, 100));
      results.push('task2 락 해제');
      release();
    };

    await Promise.all([task1(), task2()]);

    expect(results).toEqual([
      'task1 락 획득',
      'task1 락 해제',
      'task2 락 획득',
      'task2 락 해제',
    ]);
  });

  it('여러 락을 순차적으로 처리해야 한다', async () => {
    const results: string[] = [];

    const task = async (name: string) => {
      const release = await mutex.lock();
      results.push(`${name} 락 획득`);
      await new Promise(resolve => setTimeout(resolve, 50));
      results.push(`${name} 락 해제`);
      release();
    };

    await Promise.all([task('task1'), task('task2'), task('task3')]);

    expect(results).toEqual([
      'task1 락 획득',
      'task1 락 해제',
      'task2 락 획득',
      'task2 락 해제',
      'task3 락 획득',
      'task3 락 해제',
    ]);
  });
});
