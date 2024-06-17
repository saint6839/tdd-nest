export class Mutex {
  private mutex = Promise.resolve();

  lock(): PromiseLike<() => void> {
    // lock 해제 함수를 반환하는 함수
    let begin: (unlock: () => void) => void = unlock => {};

    // 현재 mutex가 resolve되면 새로운 Promise를 생성
    // 이 Promise는 begin 함수를 호출할 때까지 pending 상태
    this.mutex = this.mutex.then(() => new Promise(begin));

    // lock 해제 함수를 반환
    return new Promise(res => {
      begin = res;
    });
  }
}
