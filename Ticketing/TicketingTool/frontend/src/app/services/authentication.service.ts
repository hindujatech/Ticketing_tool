import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { BACK_END_URL } from '../shared/app.globals';
import { MatDialog, MatBottomSheet } from '@angular/material';
import { ProfilePicService } from '../shared/profile_pic.subject'



@Injectable()
export class AuthenticationService {
    constructor(private profile_pic_service: ProfilePicService, private http: HttpClient, private dialogRef: MatDialog, private bottomSheetRef: MatBottomSheet) { }

    login(username: string, password: string) {
        return this.http.post<any>(BACK_END_URL + `users/authenticateUser`, { username: username, password: password })
            .pipe(map(user => {
                // login successful if there's a jwt token in the response
                if (user && user.data.token) {
                    this.profile_pic_service.setProfilePic(user.data.profile_pic_url)
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(user));
                }
                return user;
            }));
    }

    logout() {
        // remove user from local storage to log user out
        this.bottomSheetRef.dismiss();
        this.dialogRef.closeAll();
        localStorage.removeItem('currentUser');
    }
}