/* Ponte do APK: confirmação ao sair (botão voltar) + downloads/exportações dentro do app. */
(function(){
  var C = window.Capacitor; if(!C || !C.Plugins) return;
  var App = C.Plugins.App, FS = C.Plugins.Filesystem, Share = C.Plugins.Share;

  // 1) Confirmação antes de sair
  if(App && App.addListener){
    App.addListener('backButton', function(){
      if(window.confirm('Deseja realmente sair do Sistema Kumitê Lótus?')) App.exitApp();
    });
  }

  // 2) Downloads (planilha modelo, PNG da súmula, cópia travada...): o WebView do Android
  //    não baixa arquivos "blob:" sozinho. Salvamos em Documentos e abrimos o menu de compartilhar.
  if(FS && Share){
    var origClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function(){
      var a = this;
      if(a.hasAttribute('download') && /^(blob|data):/.test(a.href)){
        fetch(a.href).then(function(r){ return r.blob(); }).then(function(blob){
          var fr = new FileReader();
          fr.onloadend = function(){
            var b64 = String(fr.result).split(',')[1] || '';
            var name = a.getAttribute('download') || ('kumite_' + Date.now());
            FS.writeFile({ path: name, data: b64, directory: 'DOCUMENTS', recursive: true })
              .then(function(res){ return Share.share({ title: name, url: res.uri, dialogTitle: 'Arquivo salvo em Documentos' }); })
              .catch(function(){ origClick.call(a); });
          };
          fr.readAsDataURL(blob);
        }).catch(function(){ origClick.call(a); });
        return;
      }
      return origClick.apply(a, arguments);
    };
  }
})();
