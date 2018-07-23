import {UserService} from "./user.service";
import {async, TestBed} from "@angular/core/testing";
import {CommonModule} from "@angular/common";

describe('User service should', () => {
  let service: UserService;
  const userNameKey = 'username';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule],
      providers: [UserService]
    })
      .compileComponents();
    service = TestBed.get(UserService);
    spyOn(service, '_restore').and.callThrough();
  }));

  it('be initialized', () => {
    expect(service.user.name).toEqual(localStorage[userNameKey]);
  });

  it('get user', () => {
    service.user.name = 'test';

    expect(service.getUser().name).toEqual('test');
  });

  it('return logged state', () => {
    service.user.name = 'test';

    expect(service.isLoggedIn()).toEqual(true);

    service.user.name = undefined;
    expect(service.isLoggedIn()).toEqual(false);
  });

  it('set user', () => {
    const testUser = {
      name: 'test',
      logo: 'testLogo.jpg'
    };

    service.setUser(testUser);

    expect(service.user).toEqual(testUser);
  });

  it('login', () => {
    spyOn(service, '_set').and.callThrough();
    const testName = 'test login';

    service.login(testName);

    expect(service._set).toHaveBeenCalledWith(testName);
    expect(service.user.name).toEqual(testName);
  });

  it('set user name', () => {
    const newUserName = 'new user';

    service._set(newUserName);

    expect(service.user.name).toEqual(newUserName);
    expect(localStorage[userNameKey]).toEqual(newUserName);
  });

  it('logout', () => {
    spyOn(service, '_set').and.callThrough();

    service.logout();

    expect(service._set).toHaveBeenCalledWith('');
    expect(localStorage[userNameKey]).toEqual('');
  });

});
