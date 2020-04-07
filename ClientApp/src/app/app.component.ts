import { environment } from './../environments/environment';
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { fromEvent, from, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'ng-image-processing-app';
  originalUrl = null;
  url = null;
  image = null;
  @ViewChild('imageOutput') imageOutput: ElementRef;
  observer;
  selectedTool = null;
  formData: any = {};

  constructor(private eleRef: ElementRef, private http: HttpClient) {}

  onFileChanged(event) {
    const files = event.target.files;
    if (files && files.length > 0) {
      const reader = new FileReader();
      const file = files[files.length - 1];
      reader.readAsDataURL(file);
      reader.onload = () => {
        // called once readAsDataURL is completed
        this.originalUrl = this.url = reader.result; // add source to image
      };
    }
  }

  selectTool(tool) {
    this.selectedTool = tool;
  }

  onStart(image) {
    const apiUrl = `${environment.apiUrl}/api/image/resize`;
    const observer = this.http.post(apiUrl, {
      image,
      options: { width: 100, height: 100 },
    });
    observer.subscribe({
      next: (res: any) => {
        this.url = res.image;
        console.log(res);
      },
    });
  }

  onSubmit(formData, type) {
    const apiUrl = `${environment.apiUrl}/api/image/resize`;
    let observable: Observable<any> = null;
    switch (type) {
      case 'resize':
        observable = this.http.post(apiUrl, {
          image: this.originalUrl,
          options: { width: formData.width, height: formData.height },
        });
        break;
    }
    observable.subscribe({
      next: (res: any) => {
        this.url = res.image;
      },
    });
  }
}
