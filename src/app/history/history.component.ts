import { Component } from '@angular/core';
import { ChatComponent } from "../chat/chat.component";

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [ChatComponent],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent {

}
