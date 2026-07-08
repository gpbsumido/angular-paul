import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Desktop } from './desktop/desktop';
import { Dock } from './dock/dock';
import { MenuBar } from './menu-bar/menu-bar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Desktop, MenuBar, Dock],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('angular-paul');
}
