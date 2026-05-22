export class AdobeSignApi{
  constructor(public apiUrl?: string, private authCode?: string) {
    this.init(apiUrl, authCode);

  }
  public init(apiUrl?: string, authCode?: string) {
    if (!apiUrl || !authCode) {
      this.initNew();
    }
  }
  private initNew() {
    const baseUrl = 'https://secure.echosign.com/public/oauth';
    const clientId = 'ats-22ccf74f-a1cb-431e-901d-bafa283abacd';
    const redirectUri = encodeURIComponent('https://app.a.clouddev.laserfiche.com/forms/form/preview?formId=b1c7011f-1e3e-424e-b7b2-12d6cc101ce4');
    const state = 'test';
    const scopes = [
      'user_login:self',
      'agreement_read:self',
      'agreement_write:self',
      'agreement_send:self',
      'widget_read:self',
      'widget_write:self',
      'library_read:self',
      'library_write:self',
    ];
    const authRequestUrl = `${baseUrl}?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scopes.join('+')}`;
    window.open(authRequestUrl, '_blank');
    window.close();
  }
}