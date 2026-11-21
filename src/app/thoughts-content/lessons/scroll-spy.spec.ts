import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FakeIntersectionObserver } from '../../../test/fake-intersection-observer';
import { ScrollSpy } from './scroll-spy';

@Component({
  imports: [ScrollSpy],
  template: `
    <div appScrollSpy>
      <section id="one">1</section>
      <section id="two">2</section>
      <section id="three">3</section>
    </div>
  `,
})
class Host {
  readonly spy = viewChild.required(ScrollSpy);
}

describe('ScrollSpy', () => {
  let fixture: ComponentFixture<Host>;
  let spy: ScrollSpy;
  const section = (id: string) => fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;

  async function render() {
    fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    spy = fixture.componentInstance.spy();
    for (const id of ['one', 'two', 'three']) spy.register(section(id));
  }

  beforeEach(() => FakeIntersectionObserver.install());
  afterEach(() => FakeIntersectionObserver.uninstall());

  it('observes every registered element', async () => {
    await render();
    expect(FakeIntersectionObserver.latest().observed).toEqual([section('one'), section('two'), section('three')]);
  });

  it('marks the first intersecting element, in registration order, as active', async () => {
    await render();
    const observer = FakeIntersectionObserver.latest();

    observer.report([
      { target: section('three'), isIntersecting: true },
      { target: section('two'), isIntersecting: true },
    ]);
    expect(spy.activeId()).toBe('two');

    observer.report([{ target: section('two'), isIntersecting: false }]);
    expect(spy.activeId()).toBe('three');
  });

  it('keeps the last active id while nothing is intersecting, e.g. mid-way through a long section', async () => {
    await render();
    const observer = FakeIntersectionObserver.latest();

    observer.report([{ target: section('two'), isIntersecting: true }]);
    observer.report([{ target: section('two'), isIntersecting: false }]);
    expect(spy.activeId()).toBe('two');
  });

  it('disconnects its observer when destroyed', async () => {
    await render();
    fixture.destroy();
    expect(FakeIntersectionObserver.latest().disconnected).toBe(true);
  });

  it('stays inert where IntersectionObserver does not exist', async () => {
    FakeIntersectionObserver.uninstall();
    vi.stubGlobal('IntersectionObserver', undefined);
    await render();
    expect(spy.activeId()).toBeNull();
    vi.unstubAllGlobals();
  });
});
