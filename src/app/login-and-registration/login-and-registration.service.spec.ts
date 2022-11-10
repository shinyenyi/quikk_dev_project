import { TestBed } from '@angular/core/testing';

import { LoginAndRegistrationService } from './login-and-registration.service';

describe('LoginAndRegistrationService', () => {
  let service: LoginAndRegistrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoginAndRegistrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
