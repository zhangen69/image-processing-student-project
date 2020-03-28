import { environment } from './../environments/environment';
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { fromEvent, from } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ng-image-processing-app';
  url = null;
  imagePath = null;
  image = null;
  @ViewChild('imageOutput') imageOutput: ElementRef;
  observer;

  constructor(private eleRef: ElementRef, private http: HttpClient) {
  }

  onFileChanged(event) {
    if (event.target.files && event.target.files.length > 0) {
      const reader = new FileReader();
      this.imagePath = event.target.files;
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = () => { // called once readAsDataURL is completed
        this.url = reader.result; // add source to image
      };
    }
  }

  onStart(elementRef: ElementRef) {
    const apiUrl = `${environment.apiUrl}/api/image/resize`;
    const observer = this.http.post(apiUrl, { image: elementRef, options: { width: 100, height: 100 } });
    observer.subscribe({
      next: (res) => {
        console.log(res);
      }
    });

  }
}
