(function(){
  var form = document.getElementById('contactForm') || document.getElementById('exhibitForm');
  if(!form) return;
  var alertBox = document.getElementById('formAlert');
  function showAlert(type, text){
    alertBox.className = 'alert alert-' + type; alertBox.textContent = text; alertBox.classList.remove('d-none');
  }
  form.addEventListener('submit', function(ev){
    if(!window.fetch){ return; }
    ev.preventDefault();
    var fd = new FormData(form);
    var email = fd.get('email'); var phone = fd.get('phone'); var msg = fd.get('message');
    if(!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !phone || !msg){
      showAlert('warning','Zkontrolujte vyplněná pole.'); return;
    }
    fetch(form.action, { method:'POST', body:fd, headers: { 'Accept':'application/json' }})
      .then(function(r){ return r.json(); })
      .then(function(data){ if(data.ok){ showAlert('success', data.message); form.reset(); } else { showAlert('danger', data.message); } })
      .catch(function(){ showAlert('danger','Došlo k chybě připojení.'); });
  });
})();


