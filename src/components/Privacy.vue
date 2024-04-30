<template>
    <div class="privacy-container" :class="{ fullopacity: visiblePrivacy }">
      <div class="content" >
          <div class="flex-machine">
            <div class="rows" >
                <div class="about-article-sub" :class="{ fullopacityui: visiblePrivacy }">
                <h2>{{ $t('message.privacy') }}</h2>
                <div id="matomo-opt-out"></div>
              </div>
            </div>
          </div>
        <button class="close-page-button" @click="$emit('close')">
          <div class="category-button" :class="{ fullopacityui: visiblePrivacy }"
            style="width:auto; padding:5px 15px; text-align: center; cursor: pointer;">{{ $t('message.close') }}</div>
        </button>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import Grid from '../Views/Grid.vue';
  
  export default {
    name: "aboutprivacy",
    emits: ['close'],
    props: {
      visiblePrivacy: {
        type: Boolean,
        required: true,
      },
      currentLanguage: {
        type: String,
        required: true,
      },
    },
    mounted() {
      console.log(this.currentLanguage);
    //   var sv_settings = {"showIntro":true,"divId":"matomo-opt-out","useSecureCookies":true,"cookiePath":null,"cookieDomain":null,"cookieSameSite":"Lax","OptOutComplete":"Exkludering utf\u00f6rd; dina bes\u00f6k p\u00e5 denna webbplatsen kommer inte att sp\u00e5ras av webbanalys-verktyget.","OptOutCompleteBis":"Observera att om du rensar cookies, tar bort cookien f\u00f6r exkludering eller om du byter dator eller webbl\u00e4sare m\u00e5ste du utf\u00f6ra exkluderingen igen.","YouMayOptOut2":"Du kan v\u00e4lja att neka den h\u00e4r webbplatsen tillst\u00e5nd att samla in och analysera information om dina handlingar h\u00e4r.","YouMayOptOut3":"Genom att g\u00f6ra s\u00e5 kommer du skydda din integritet, men kommer \u00e4ven hindra \u00e4garen att l\u00e4ra fr\u00e5n dina handlingar och d\u00e4rigenom skapa en b\u00e4ttre upplevelse f\u00f6r dig och andra anv\u00e4ndare.","OptOutErrorNoCookies":"Funktionen f\u00f6r opt-out fr\u00e5n sp\u00e5rning kr\u00e4ver att cookies \u00e4r aktiverade.","OptOutErrorNotHttps":"Funktionen f\u00f6r opt-out fr\u00e5n sp\u00e5rning kanske inte fungerar eftersom denna webbplats inte laddades \u00f6ver HTTPS. Ladda om sidan f\u00f6r att kolla om din opt-out status \u00e4ndrats.","YouAreNotOptedOut":"Du har inte valt bort det.","UncheckToOptOut":"Avmarkera rutan f\u00f6r att inte vara med.","YouAreOptedOut":"Du \u00e4r just nu exkluderad.","CheckToOptIn":"Markera rutan f\u00f6r att vara med."};         
        // var en_settings = {"showIntro":true,"divId":"matomo-opt-out","useSecureCookies":true,"cookiePath":null,"cookieDomain":null,"cookieSameSite":"Lax","OptOutComplete":"Opt-out complete; your visits to this website will not be recorded by the Web Analytics tool.","OptOutCompleteBis":"Note that if you clear your cookies, delete the opt-out cookie, or if you change computers or Web browsers, you will need to perform the opt-out procedure again.","YouMayOptOut2":"You may choose to prevent this website from aggregating and analyzing the actions you take here.","YouMayOptOut3":"Doing so will protect your privacy, but will also prevent the owner from learning from your actions and creating a better experience for you and other users.","OptOutErrorNoCookies":"The tracking opt-out feature requires cookies to be enabled.","OptOutErrorNotHttps":"The tracking opt-out feature may not work because this site was not loaded over HTTPS. Please reload the page to check if your opt out status changed.","YouAreNotOptedOut":"You are not opted out.","UncheckToOptOut":"Uncheck this box to opt-out.","YouAreOptedOut":"You are currently opted out.","CheckToOptIn":"Check this box to opt-in."};
        // if (this.currentLanguage === 'en') {var settings = en_settings;} else {var settings = sv_settings;}
        var settings = {"showIntro":true,"divId":"matomo-opt-out","useSecureCookies":true,"cookiePath":null,"cookieDomain":null,"cookieSameSite":"Lax","OptOutComplete":"Opt-out complete; your visits to this website will not be recorded by the Web Analytics tool.","OptOutCompleteBis":"Note that if you clear your cookies, delete the opt-out cookie, or if you change computers or Web browsers, you will need to perform the opt-out procedure again.","YouMayOptOut2":"You may choose to prevent this website from aggregating and analyzing the actions you take here.","YouMayOptOut3":"Doing so will protect your privacy, but will also prevent the owner from learning from your actions and creating a better experience for you and other users.","OptOutErrorNoCookies":"The tracking opt-out feature requires cookies to be enabled.","OptOutErrorNotHttps":"The tracking opt-out feature may not work because this site was not loaded over HTTPS. Please reload the page to check if your opt out status changed.","YouAreNotOptedOut":"You are not opted out.","UncheckToOptOut":"Uncheck this box to opt-out.","YouAreOptedOut":"You are currently opted out.","CheckToOptIn":"Check this box to opt-in."};
      document.addEventListener('DOMContentLoaded', function() {                             
        window.MatomoConsent.init(settings.useSecureCookies, settings.cookiePath, settings.cookieDomain, settings.cookieSameSite);                
        showContent(window.MatomoConsent.hasConsent());        
    });    
    
    
        function showContent(consent, errorMessage = null, useTracker = false) {
    
            var errorBlock = '<p style="color: red; font-weight: bold;">';
    
            var div = document.getElementById(settings.divId);
            if (!div) {
                const warningDiv = document.createElement("div");
                var msg = 'Unable to find opt-out content div: "'+settings.divId+'"';
                warningDiv.id = settings.divId+'-warning';
                warningDiv.innerHTML = errorBlock+msg+'</p>';
                document.body.insertBefore(warningDiv, document.body.firstChild);
                console.log(msg);
                return;
            }
            
            if (!navigator || !navigator.cookieEnabled) {
                div.innerHTML = errorBlock+settings.OptOutErrorNoCookies+'</p>';
                return;
            }
            if (location.protocol !== 'https:') {
                div.innerHTML = errorBlock+settings.OptOutErrorNotHttps+'</p>';
                return;
            }        
            if (errorMessage !== null) {
                div.innerHTML = errorBlock+errorMessage+'</p>';
                return;
            }
            var content = '';        
            if (consent) {
                if (settings.showIntro) {
                    content += '<p>'+settings.YouMayOptOut2+' '+settings.YouMayOptOut3+'</p>';                       
                }
                if (useTracker) {
                    content += '<input onclick="_paq.push([\'optUserOut\']);showContent(false, null, true);" id="trackVisits" type="checkbox" checked="checked" />';
                } else {
                    content += '<input onclick="window.MatomoConsent.consentRevoked();showContent(false);" id="trackVisits" type="checkbox" checked="checked" />';
                }
                content += '<label for="trackVisits"><strong><span>'+settings.YouAreNotOptedOut+' '+settings.UncheckToOptOut+'</span></strong></label>';                               
            } else {
                if (settings.showIntro) {
                    content += '<p>'+settings.OptOutComplete+' '+settings.OptOutCompleteBis+'</p>';
                }
                if (useTracker) {
                    content += '<input onclick="_paq.push([\'forgetUserOptOut\']);showContent(true, null, true);" id="trackVisits" type="checkbox" />';
                } else {
                    content += '<input onclick="window.MatomoConsent.consentGiven();showContent(true);" id="trackVisits" type="checkbox" />';
                }
                content += '<label for="trackVisits"><strong><span>'+settings.YouAreOptedOut+' '+settings.CheckToOptIn+'</span></strong></label>';
            }                   
            div.innerHTML = content;      
        };   

        window.MatomoConsent = {                         
            cookiesDisabled: (!navigator || !navigator.cookieEnabled),        
            CONSENT_COOKIE_NAME: 'mtm_consent', CONSENT_REMOVED_COOKIE_NAME: 'mtm_consent_removed', 
            cookieIsSecure: false, useSecureCookies: true, cookiePath: '', cookieDomain: '', cookieSameSite: 'Lax',     
            init: function(useSecureCookies, cookiePath, cookieDomain, cookieSameSite) {
                this.useSecureCookies = useSecureCookies; this.cookiePath = cookiePath;
                this.cookieDomain = cookieDomain; this.cookieSameSite = cookieSameSite;
                if(useSecureCookies && location.protocol !== 'https:') {
                    console.log('Error with setting useSecureCookies: You cannot use this option on http.');             
                } else {
                    this.cookieIsSecure = useSecureCookies;
                }
            },               
            hasConsent: function() {
                var consentCookie = this.getCookie(this.CONSENT_COOKIE_NAME);
                var removedCookie = this.getCookie(this.CONSENT_REMOVED_COOKIE_NAME);
                if (!consentCookie && !removedCookie) {
                    return true; // No cookies set, so opted in
                }
                if (removedCookie && consentCookie) {                
                    this.setCookie(this.CONSENT_COOKIE_NAME, '', -129600000);              
                    return false;
                }                
                return (consentCookie || consentCookie !== 0);            
            },        
            consentGiven: function() {                                                        
                this.setCookie(this.CONSENT_REMOVED_COOKIE_NAME, '', -129600000);
                this.setCookie(this.CONSENT_COOKIE_NAME, new Date().getTime(), 946080000000);
            },      
            consentRevoked: function() {    
                this.setCookie(this.CONSENT_COOKIE_NAME, '', -129600000);
                this.setCookie(this.CONSENT_REMOVED_COOKIE_NAME, new Date().getTime(), 946080000000);                
            },                   
            getCookie: function(cookieName) {            
                var cookiePattern = new RegExp('(^|;)[ ]*' + cookieName + '=([^;]*)'), cookieMatch = cookiePattern.exec(document.cookie);
                return cookieMatch ? window.decodeURIComponent(cookieMatch[2]) : 0;
            },        
            setCookie: function(cookieName, value, msToExpire) {                       
                var expiryDate = new Date();
                expiryDate.setTime((new Date().getTime()) + msToExpire);            
                document.cookie = cookieName + '=' + window.encodeURIComponent(value) +
                    (msToExpire ? ';expires=' + expiryDate.toGMTString() : '') +
                    ';path=' + (this.cookiePath || '/') +
                    (this.cookieDomain ? ';domain=' + this.cookieDomain : '') +
                    (this.cookieIsSecure ? ';secure' : '') +
                    ';SameSite=' + this.cookieSameSite;               
                if ((!msToExpire || msToExpire >= 0) && this.getCookie(cookieName) !== String(value)) {
                    console.log('There was an error setting cookie `' + cookieName + '`. Please check domain and path.');                
                }
            }
        };           
    },
  };
  </script>
  
  <style scoped>
  .content {
    /* border:opx; */
    height: 50%;
  }
  
  li {
    list-style: inside;
    margin-left: 30px;
  }
  
  a {
    color: rgb(156, 201, 247);
    font-weight: 400;
  }
  
  h2 {
    font-size: 115%;
    font-style: bold;
    margin-top: -10px;
    margin-bottom: 5px;
    color: rgb(200, 225, 250);
    font-weight: 500;
    line-height: 1.5;
  }
  
  .privacy-container {
    position: fixed;
    color: white;
    line-height: 1;
    width: 500px;
    height: 100px;
    font-size: 12px;
    z-index: 4000;
    backdrop-filter: blur(5px);
    pointer-events: none;
    transform: scale(1.5);
    translate: 0px 100px;
    transition: all 0.5s ease-in-out;
    opacity: 0.0;
    bottom: 5%;
    left: 40%;
    top: 10%;
    transform: translateY(-50%);
    background: linear-gradient(120deg, rgb(50, 50, 50) 10%, rgba(65, 65, 65, 0.95) 30%);
  }
  
  
  .fullopacity {
    /* backdrop-filter:blur(5px); */
    opacity: 1.0;
    pointer-events: auto;
    transform: scale(1.0);
    translate: 0px 0px;
    background: linear-gradient(120deg, rgb(50, 50, 50) 10%, rgba(65, 65, 65, 0.95) 80%);
    height: 100%;
  }
  
  .flex-machine {
    height: 30%;
    display: flex;
    flex-direction: column;
  }
  
  .rows {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: start;
    width: auto;
  }
  
  .about-main-title {
    font-family: 'Teko', sans-serif;
    margin-top: 10px;
    flex-basis: auto;
    width: 100%;
    font-size: 4em;
    line-height: 0.85;
    font-weight: 100;
    letter-spacing: -0.2px;
    text-align: center;
    color: rgba(245, 245, 245, 0.8);
    margin-bottom: 15px;
    transition: all 0.4s ease-in-out;
  }
  
  .about-article-sub {
    position: relative;
    float: left;
    text-align: justify;
    color: white;
    columns: 1;
    width: 100%;
    padding: 30px 100px;
    column-gap: 30px;
    max-width: 1600px;
    font-size: 1.7em;
    font-weight: 300;
    opacity: 0.0;
    transition: all 0.4s ease-in-out;
    line-height: 1.2;
    padding-bottom: 120px !important;
  }
  .category-button {
  float: left;
  font-size: 1.8em;
  font-weight: 400;
  transition: all 0.4s ease-in-out;
  background-color: rgb(80, 90, 100);
  padding: 8px 20px !important;
  z-index: 1000;
  opacity: 1.0;
  margin-top: 0px;
  margin-bottom: 0px;
  border-radius: 5px;
  box-shadow: 0rem 2px 15px rgba(0, 0, 0, 0.2) !important;
}
  .close-page-button {
    position: sticky;
    z-index: 3000;
    bottom: 0px;
    top: calc(100vh - 80px);
    padding-bottom: 20px;
    color: white;
    /* background: linear-gradient(0deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.0) 100%); */
    /* background: black; */
    width: 100%;
    height: 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: end;
  }
  
  @media screen and (max-width: 900px) {
  
    .about-article-sub {
      font-size: 1.25em;
      -webkit-hyphens: auto;
      -ms-hyphens: auto;
      hyphens: auto;
    }
  }
  
  .about-logo-top-right {
    z-index: 1000;
    display: flex;
    pointer-events: none;
    width: 200px;
    height: 90px;
    position: absolute;
    /*background:url("../assets/shfa_logo_downscale.png");*/
    background-repeat: no-repeat;
    background-size: contain;
    top: 30px;
    right: 60px;
    opacity: 0.6;
    color: whitesmoke;
    transition: all 0.4s ease-in-out;
  }
  
  @media (max-width:480px) {
    .logo-area {
      margin-top: 20px;
    }
  
    #logo-about {
      width: 120px;
      height: 100px;
      margin-left: 0px;
    }
  
    .title {
      margin-top: 0px;
      font-size: 35px;
      padding-left: 10px;
    }
  
    .about-article-main {
      position: relative;
      float: left;
      text-align: center;
      color: white;
      width: 100%;
      columns: 1;
      column-gap: 30px;
      max-width: 1600px;
      font-size: 2.0em;
      opacity: 0.0;
      padding: 0px 100px;
      transition: all 0.4s ease-in-out;
    }
  
    .about-article-sub {
      text-align: justify;
      columns: 1;
      width: 100%;
      padding: 30px;
      font-size: 1.2em;
      font-weight: 300;
      transition: all 0.4s ease-in-out;
      line-height: 1.2;
    }
  }
  
  .fullopacityui {
    opacity: 1.0;
  }
  
  a {
    font-weight: normal;
  }
  </style>
  