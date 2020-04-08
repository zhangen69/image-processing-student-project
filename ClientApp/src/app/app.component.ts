import { environment } from './../environments/environment';
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { fromEvent, from, Observable } from 'rxjs';
import { retry } from 'rxjs/operators';
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
  selectedHistoryItem = null;
  formData: any = {
    fontSize: 'FONT_SANS_8',
    fontColor: 'BLACK',
    positionX: 0,
    positionY: 0,
    width: 500,
    height: 500,
    level: 1,
    degree: 90,
    flipHorizontal: false,
    flipVertical: false,
  };
  apiUrl = `${environment.apiUrl}/api/image`;
  error = null;
  history = [];

  constructor(private eleRef: ElementRef, private http: HttpClient) {}

  onFileChanged(event) {
    const files = event.target.files;
    if (files && files.length > 0) {
      const reader = new FileReader();
      const file = files[files.length - 1];
      reader.readAsDataURL(file);
      reader.onload = () => {
        // called once readAsDataURL is completed
        this.history.push({
          id: this.createRandomString(),
          name: 'Select File: ' + file.name,
          image: reader.result,
        });
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

  onRevertUrl(item = null) {
    if (!item) {
      this.url = this.originalUrl;
    } else {
      this.url = item.image;
    }
  }

  createRandomString() {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  onSubmit(formData: any, type: string, url: string) {
    const historyItem = {
      id: this.createRandomString(),
      name: null,
      image: null,
    };
    let observable: Observable<any> = null;

    switch (type) {
      case 'resize':
      case 'cover':
        historyItem.name = `${type.toUpperCase()}: w=${formData.width}px, h=${
          formData.height
        }px`;
        observable = this.http.post(`${this.apiUrl}/${type}`, {
          image: url,
          options: { width: formData.width, height: formData.height },
        });
        break;
      case 'blur':
      case 'opacity':
      case 'contrast':
      case 'scale':
        historyItem.name = `${type.toUpperCase()}: level=${formData.level}`;
        observable = this.http.post(`${this.apiUrl}/${type}`, {
          image: url,
          options: { level: formData.level },
        });
        break;
      case 'rotate':
        historyItem.name = `${type.toUpperCase()}: degree=${
          formData.degree
        }&deg;`;
        observable = this.http.post(`${this.apiUrl}/${type}`, {
          image: url,
          options: { degree: formData.degree },
        });
        break;
      case 'flip':
        historyItem.name = `${type.toUpperCase()}: horizontal=${
          formData.flipHorizontal ? 'Yes' : 'No'
        }, vertical=${formData.flipVertical ? 'Yes' : 'No'};`;
        observable = this.http.post(`${this.apiUrl}/${type}`, {
          image: url,
          options: {
            flipHorizontal: formData.flipHorizontal,
            flipVertical: formData.flipVertical,
          },
        });
        break;
      case 'printText':
        historyItem.name = `${type.toUpperCase()}: size=${
          formData.fontSize
        }, text=${formData.text}, color=${formData.fontColor}, x=${
          formData.positionX
        }, y=${formData.positionY}`;
        const font = formData.fontSize + '_' + formData.fontColor;
        observable = this.http.post(`${this.apiUrl}/${type}`, {
          image: url,
          options: {
            font,
            text: formData.text,
            x: formData.positionX,
            y: formData.positionY,
          },
        });
        break;
      default:
        historyItem.name = `${type.toUpperCase()}`;
        observable = this.http.post(`${this.apiUrl}/${type}`, {
          image: url,
          options: null,
        });
        break;
    }

    const subscription = observable.pipe(retry(3)).subscribe({
      next: (res: any) => {
        historyItem.image = res.image;
        this.history.push(historyItem);
        this.url = res.image;
        if (this.error) {
          this.error = null;
        }
      },
      error: (err) => {
        this.error = err;
        window.alert('Failed to process image');
        console.error('failed to process image', err);
      },
      complete: () => {
        subscription.unsubscribe();
      },
    });
  }
}
