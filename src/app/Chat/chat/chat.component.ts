import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AuthService } from 'src/app/Service/auth.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  generative!: GoogleGenerativeAI;

  constructor(public auth: AngularFireAuth, private http: HttpClient, private router: Router, public _serviceAuth: AuthService) {
    this.generative = new GoogleGenerativeAI('AIzaSyD77VYqM_LsBJGGuHPb0M778C56JNXucqI')

  }

  ngOnInit(): void {
    if (this._serviceAuth.user == null) {
      this.router.navigate(['/']);
    }
  }

  getEmailInitial(): string {
    const email = this._serviceAuth.user.multiFactor.user.email;
    if (email && email.length > 0) {
      return email.charAt(0).toUpperCase(); // Retourne le premier caractère en majuscule
    } else {
      return ''; // Retourne une chaîne vide si l'e-mail est vide
    }
  }

  userInput: string = '';

  messages: { role: string; content: string; }[] = [];


  async sendMessage() {
    this.messages.push({ role: "user", content: this.userInput });

    const model = this.generative.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(this.userInput);

    this.userInput = '';

    const resp = await result.response;
    const text = resp.text();

    this.messages.push({ role: "system", content: text });
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === "Enter") {
      this.sendMessage();
    }
  }

  signOut() {
    this.auth.signOut()
      .then(() => {
        this._serviceAuth.user = null;
        console.log('Déconnexion réussie!');
        this.router.navigate(['/']);
      })
      .catch((error) => {
        console.error('Erreur lors de la déconnexion:', error);
      });
  }
}

