import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Desktop } from './desktop/desktop';
import { MenuBar } from './menu-bar/menu-bar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Desktop, MenuBar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('angular-paul');
}
