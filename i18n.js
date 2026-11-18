// FreightIQ Marine :: Internationalization (i18n)
// Practical, extensible framework: covers the app's shared UI chrome (nav,
// buttons, common labels, page titles) in a broad set of languages.
// Server-generated explanatory text (forecast reasoning, risk detail
// sentences, etc.) stays in English in this build — see docs/i18n.md for
// how to extend translated coverage to that content.

const FIQ_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'zh', name: 'Chinese', native: '中文' },
];

const FIQ_TRANSLATIONS = {
en: { brand_tagline:"Intelligent Freight Forecasting · Vessel Chartering · Bulk Cargo Procurement", nav_dashboard:"Command Dashboard", nav_forecast:"Freight Forecast", nav_fleet:"Fleet & GPS Tracking", nav_ports:"Port Intelligence", nav_vessels:"Vessel Optimizer", nav_shipper:"Shipper Workspace", nav_contracts:"Contract Intelligence", nav_risk:"Risk Center", nav_alerts:"Alerts", nav_audit:"Audit Log", nav_users:"User Management", nav_reports:"Reports Center", btn_signin:"Sign In", btn_signout:"Sign out", btn_submit:"Submit", btn_export_csv:"Export CSV", btn_print:"Print / Save as PDF", btn_generate:"Generate", loading:"Loading…", search:"Search", status:"Status", active:"Active", available:"Available", email:"Email", password:"Password", reduced_motion:"Reduced motion", language:"Language", theme:"Theme", currency:"Currency", welcome:"Welcome", no_data:"No data available." },
hi: { brand_tagline:"स्मार्ट माल भाड़ा पूर्वानुमान · पोत चार्टरिंग · थोक कार्गो खरीद", nav_dashboard:"कमांड डैशबोर्ड", nav_forecast:"माल भाड़ा पूर्वानुमान", nav_fleet:"बेड़ा और जीपीएस ट्रैकिंग", nav_ports:"पोर्ट इंटेलिजेंस", nav_vessels:"पोत अनुकूलक", nav_shipper:"शिपर कार्यक्षेत्र", nav_contracts:"अनुबंध इंटेलिजेंस", nav_risk:"जोखिम केंद्र", nav_alerts:"अलर्ट", nav_audit:"ऑडिट लॉग", nav_users:"उपयोगकर्ता प्रबंधन", nav_reports:"रिपोर्ट केंद्र", btn_signin:"साइन इन करें", btn_signout:"साइन आउट", btn_submit:"जमा करें", btn_export_csv:"CSV निर्यात करें", btn_print:"प्रिंट / पीडीएफ सहेजें", btn_generate:"जनरेट करें", loading:"लोड हो रहा है…", search:"खोजें", status:"स्थिति", active:"सक्रिय", available:"उपलब्ध", email:"ईमेल", password:"पासवर्ड", reduced_motion:"कम एनिमेशन", language:"भाषा", theme:"थीम", currency:"मुद्रा", welcome:"स्वागत है", no_data:"कोई डेटा उपलब्ध नहीं है।" },
bn: { brand_tagline:"স্মার্ট ফ্রেট পূর্বাভাস · জাহাজ চার্টারিং · বাল্ক কার্গো সংগ্রহ", nav_dashboard:"কমান্ড ড্যাশবোর্ড", nav_forecast:"ফ্রেট পূর্বাভাস", nav_fleet:"ফ্লিট ও জিপিএস ট্র্যাকিং", nav_ports:"পোর্ট ইন্টেলিজেন্স", nav_vessels:"ভেসেল অপটিমাইজার", nav_shipper:"শিপার ওয়ার্কস্পেস", nav_contracts:"চুক্তি ইন্টেলিজেন্স", nav_risk:"ঝুঁকি কেন্দ্র", nav_alerts:"সতর্কতা", nav_audit:"অডিট লগ", nav_users:"ব্যবহারকারী ব্যবস্থাপনা", nav_reports:"রিপোর্ট কেন্দ্র", btn_signin:"সাইন ইন", btn_signout:"সাইন আউট", btn_submit:"জমা দিন", btn_export_csv:"CSV এক্সপোর্ট", btn_print:"প্রিন্ট / পিডিএফ সেভ", btn_generate:"তৈরি করুন", loading:"লোড হচ্ছে…", search:"অনুসন্ধান", status:"অবস্থা", active:"সক্রিয়", available:"উপলব্ধ", email:"ইমেইল", password:"পাসওয়ার্ড", reduced_motion:"কম অ্যানিমেশন", language:"ভাষা", theme:"থিম", currency:"মুদ্রা", welcome:"স্বাগতম", no_data:"কোনো ডেটা উপলব্ধ নেই।" },
te: { brand_tagline:"స్మార్ట్ ఫ్రైట్ అంచనా · నౌక చార్టరింగ్ · బల్క్ కార్గో సేకరణ", nav_dashboard:"కమాండ్ డాష్‌బోర్డ్", nav_forecast:"ఫ్రైట్ అంచనా", nav_fleet:"ఫ్లీట్ & జీపీఎస్ ట్రాకింగ్", nav_ports:"పోర్ట్ ఇంటెలిజెన్స్", nav_vessels:"వెసెల్ ఆప్టిమైజర్", nav_shipper:"షిప్పర్ వర్క్‌స్పేస్", nav_contracts:"కాంట్రాక్ట్ ఇంటెలిజెన్స్", nav_risk:"రిస్క్ సెంటర్", nav_alerts:"హెచ్చరికలు", nav_audit:"ఆడిట్ లాగ్", nav_users:"వినియోగదారు నిర్వహణ", nav_reports:"రిపోర్ట్స్ సెంటర్", btn_signin:"సైన్ ఇన్", btn_signout:"సైన్ అవుట్", btn_submit:"సమర్పించండి", btn_export_csv:"CSV ఎగుమతి", btn_print:"ప్రింట్ / పీడీఎఫ్ సేవ్", btn_generate:"జనరేట్ చేయండి", loading:"లోడ్ అవుతోంది…", search:"వెతకండి", status:"స్థితి", active:"యాక్టివ్", available:"అందుబాటులో", email:"ఇమెయిల్", password:"పాస్‌వర్డ్", reduced_motion:"తక్కువ యానిమేషన్", language:"భాష", theme:"థీమ్", currency:"కరెన్సీ", welcome:"స్వాగతం", no_data:"డేటా అందుబాటులో లేదు." },
mr: { brand_tagline:"स्मार्ट फ्रेट अंदाज · जहाज चार्टरिंग · मोठ्या प्रमाणात मालवाहतूक खरेदी", nav_dashboard:"कमांड डॅशबोर्ड", nav_forecast:"फ्रेट अंदाज", nav_fleet:"ताफा आणि जीपीएस ट्रॅकिंग", nav_ports:"पोर्ट इंटेलिजन्स", nav_vessels:"जहाज ऑप्टिमायझर", nav_shipper:"शिपर कार्यक्षेत्र", nav_contracts:"करार इंटेलिजन्स", nav_risk:"जोखीम केंद्र", nav_alerts:"सूचना", nav_audit:"ऑडिट लॉग", nav_users:"वापरकर्ता व्यवस्थापन", nav_reports:"अहवाल केंद्र", btn_signin:"साइन इन", btn_signout:"साइन आउट", btn_submit:"सबमिट करा", btn_export_csv:"CSV निर्यात करा", btn_print:"प्रिंट / पीडीएफ सेव्ह करा", btn_generate:"तयार करा", loading:"लोड होत आहे…", search:"शोधा", status:"स्थिती", active:"सक्रिय", available:"उपलब्ध", email:"ईमेल", password:"पासवर्ड", reduced_motion:"कमी अ‍ॅनिमेशन", language:"भाषा", theme:"थीम", currency:"चलन", welcome:"स्वागत आहे", no_data:"डेटा उपलब्ध नाही." },
ta: { brand_tagline:"ஸ்மார்ட் ஃப்ரைட் முன்னறிவிப்பு · கப்பல் சார்ட்டரிங் · மொத்த சரக்கு கொள்முதல்", nav_dashboard:"கட்டளை டாஷ்போர்டு", nav_forecast:"ஃப்ரைட் முன்னறிவிப்பு", nav_fleet:"கப்பற்படை & ஜிபிஎஸ் கண்காணிப்பு", nav_ports:"துறைமுக நுண்ணறிவு", nav_vessels:"கப்பல் உகந்தமயமாக்கி", nav_shipper:"ஷிப்பர் பணியிடம்", nav_contracts:"ஒப்பந்த நுண்ணறிவு", nav_risk:"இடர் மையம்", nav_alerts:"எச்சரிக்கைகள்", nav_audit:"தணிக்கை பதிவு", nav_users:"பயனர் மேலாண்மை", nav_reports:"அறிக்கை மையம்", btn_signin:"உள்நுழைக", btn_signout:"வெளியேறு", btn_submit:"சமர்ப்பிக்க", btn_export_csv:"CSV ஏற்றுமதி", btn_print:"அச்சிடு / PDF சேமி", btn_generate:"உருவாக்கு", loading:"ஏற்றுகிறது…", search:"தேடு", status:"நிலை", active:"செயலில்", available:"கிடைக்கிறது", email:"மின்னஞ்சல்", password:"கடவுச்சொல்", reduced_motion:"குறைந்த அசைவூட்டம்", language:"மொழி", theme:"தீம்", currency:"நாணயம்", welcome:"வரவேற்கிறோம்", no_data:"தரவு இல்லை." },
gu: { brand_tagline:"સ્માર્ટ ફ્રેટ આગાહી · વહાણ ચાર્ટરિંગ · જથ્થાબંધ કાર્ગો ખરીદી", nav_dashboard:"કમાન્ડ ડેશબોર્ડ", nav_forecast:"ફ્રેટ આગાહી", nav_fleet:"કાફલો અને જીપીએસ ટ્રેકિંગ", nav_ports:"પોર્ટ ઇન્ટેલિજન્સ", nav_vessels:"વહાણ ઓપ્ટિમાઇઝર", nav_shipper:"શિપર વર્કસ્પેસ", nav_contracts:"કરાર ઇન્ટેલિજન્સ", nav_risk:"જોખમ કેન્દ્ર", nav_alerts:"ચેતવણીઓ", nav_audit:"ઓડિટ લોગ", nav_users:"વપરાશકર્તા સંચાલન", nav_reports:"રિપોર્ટ્સ કેન્દ્ર", btn_signin:"સાઇન ઇન", btn_signout:"સાઇન આઉટ", btn_submit:"સબમિટ કરો", btn_export_csv:"CSV નિકાસ કરો", btn_print:"પ્રિન્ટ / પીડીએફ સેવ કરો", btn_generate:"જનરેટ કરો", loading:"લોડ થઈ રહ્યું છે…", search:"શોધો", status:"સ્થિતિ", active:"સક્રિય", available:"ઉપલબ્ધ", email:"ઈમેલ", password:"પાસવર્ડ", reduced_motion:"ઓછું એનિમેશન", language:"ભાષા", theme:"થીમ", currency:"ચલણ", welcome:"સ્વાગત છે", no_data:"કોઈ ડેટા ઉપલબ્ધ નથી." },
kn: { brand_tagline:"ಸ್ಮಾರ್ಟ್ ಫ್ರೇಟ್ ಮುನ್ಸೂಚನೆ · ಹಡಗು ಚಾರ್ಟರಿಂಗ್ · ಬೃಹತ್ ಸರಕು ಖರೀದಿ", nav_dashboard:"ಕಮಾಂಡ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", nav_forecast:"ಫ್ರೇಟ್ ಮುನ್ಸೂಚನೆ", nav_fleet:"ಫ್ಲೀಟ್ ಮತ್ತು ಜಿಪಿಎಸ್ ಟ್ರ್ಯಾಕಿಂಗ್", nav_ports:"ಬಂದರು ಬುದ್ಧಿಮತ್ತೆ", nav_vessels:"ಹಡಗು ಆಪ್ಟಿಮೈಜರ್", nav_shipper:"ಶಿಪ್ಪರ್ ಕಾರ್ಯಕ್ಷೇತ್ರ", nav_contracts:"ಒಪ್ಪಂದ ಬುದ್ಧಿಮತ್ತೆ", nav_risk:"ಅಪಾಯ ಕೇಂದ್ರ", nav_alerts:"ಎಚ್ಚರಿಕೆಗಳು", nav_audit:"ಆಡಿಟ್ ಲಾಗ್", nav_users:"ಬಳಕೆದಾರ ನಿರ್ವಹಣೆ", nav_reports:"ವರದಿಗಳ ಕೇಂದ್ರ", btn_signin:"ಸೈನ್ ಇನ್", btn_signout:"ಸೈನ್ ಔಟ್", btn_submit:"ಸಲ್ಲಿಸಿ", btn_export_csv:"CSV ರಫ್ತು", btn_print:"ಮುದ್ರಿಸಿ / ಪಿಡಿಎಫ್ ಉಳಿಸಿ", btn_generate:"ರಚಿಸಿ", loading:"ಲೋಡ್ ಆಗುತ್ತಿದೆ…", search:"ಹುಡುಕಿ", status:"ಸ್ಥಿತಿ", active:"ಸಕ್ರಿಯ", available:"ಲಭ್ಯವಿದೆ", email:"ಇಮೇಲ್", password:"ಪಾಸ್‌ವರ್ಡ್", reduced_motion:"ಕಡಿಮೆ ಚಲನೆ", language:"ಭಾಷೆ", theme:"ಥೀಮ್", currency:"ಕರೆನ್ಸಿ", welcome:"ಸ್ವಾಗತ", no_data:"ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ." },
ml: { brand_tagline:"സ്മാർട്ട് ഫ്രെയിറ്റ് പ്രവചനം · കപ്പൽ ചാർട്ടറിംഗ് · ബൾക്ക് കാർഗോ സംഭരണം", nav_dashboard:"കമാൻഡ് ഡാഷ്‌ബോർഡ്", nav_forecast:"ഫ്രെയിറ്റ് പ്രവചനം", nav_fleet:"ഫ്ലീറ്റ് & ജിപിഎസ് ട്രാക്കിംഗ്", nav_ports:"പോർട്ട് ഇന്റലിജൻസ്", nav_vessels:"കപ്പൽ ഒപ്റ്റിമൈസർ", nav_shipper:"ഷിപ്പർ വർക്ക്‌സ്പേസ്", nav_contracts:"കരാർ ഇന്റലിജൻസ്", nav_risk:"റിസ്ക് സെന്റർ", nav_alerts:"അലേർട്ടുകൾ", nav_audit:"ഓഡിറ്റ് ലോഗ്", nav_users:"ഉപയോക്തൃ മാനേജ്‌മെന്റ്", nav_reports:"റിപ്പോർട്ട് സെന്റർ", btn_signin:"സൈൻ ഇൻ", btn_signout:"സൈൻ ഔട്ട്", btn_submit:"സമർപ്പിക്കുക", btn_export_csv:"CSV എക്സ്പോർട്ട്", btn_print:"പ്രിന്റ് / പിഡിഎഫ് സേവ്", btn_generate:"ജനറേറ്റ് ചെയ്യുക", loading:"ലോഡ് ചെയ്യുന്നു…", search:"തിരയുക", status:"നില", active:"സജീവം", available:"ലഭ്യമാണ്", email:"ഇമെയിൽ", password:"പാസ്‌വേഡ്", reduced_motion:"കുറഞ്ഞ ആനിമേഷൻ", language:"ഭാഷ", theme:"തീം", currency:"കറൻസി", welcome:"സ്വാഗതം", no_data:"ഡാറ്റ ലഭ്യമല്ല." },
pa: { brand_tagline:"ਸਮਾਰਟ ਫਰੇਟ ਭਵਿੱਖਬਾਣੀ · ਜਹਾਜ਼ ਚਾਰਟਰਿੰਗ · ਥੋਕ ਕਾਰਗੋ ਖਰੀਦ", nav_dashboard:"ਕਮਾਂਡ ਡੈਸ਼ਬੋਰਡ", nav_forecast:"ਫਰੇਟ ਭਵਿੱਖਬਾਣੀ", nav_fleet:"ਫਲੀਟ ਅਤੇ ਜੀਪੀਐਸ ਟਰੈਕਿੰਗ", nav_ports:"ਪੋਰਟ ਇੰਟੈਲੀਜੈਂਸ", nav_vessels:"ਜਹਾਜ਼ ਔਪਟੀਮਾਈਜ਼ਰ", nav_shipper:"ਸ਼ਿਪਰ ਵਰਕਸਪੇਸ", nav_contracts:"ਇਕਰਾਰਨਾਮਾ ਇੰਟੈਲੀਜੈਂਸ", nav_risk:"ਜੋਖਮ ਕੇਂਦਰ", nav_alerts:"ਚੇਤਾਵਨੀਆਂ", nav_audit:"ਆਡਿਟ ਲੌਗ", nav_users:"ਯੂਜ਼ਰ ਪ੍ਰਬੰਧਨ", nav_reports:"ਰਿਪੋਰਟ ਕੇਂਦਰ", btn_signin:"ਸਾਈਨ ਇਨ", btn_signout:"ਸਾਈਨ ਆਉਟ", btn_submit:"ਜਮ੍ਹਾਂ ਕਰੋ", btn_export_csv:"CSV ਐਕਸਪੋਰਟ", btn_print:"ਪ੍ਰਿੰਟ / ਪੀਡੀਐਫ ਸੇਵ", btn_generate:"ਬਣਾਓ", loading:"ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ…", search:"ਖੋਜੋ", status:"ਸਥਿਤੀ", active:"ਸਰਗਰਮ", available:"ਉਪਲਬਧ", email:"ਈਮੇਲ", password:"ਪਾਸਵਰਡ", reduced_motion:"ਘੱਟ ਐਨੀਮੇਸ਼ਨ", language:"ਭਾਸ਼ਾ", theme:"ਥੀਮ", currency:"ਮੁਦਰਾ", welcome:"ਜੀ ਆਇਆਂ ਨੂੰ", no_data:"ਕੋਈ ਡਾਟਾ ਉਪਲਬਧ ਨਹੀਂ।" },
or: { brand_tagline:"ସ୍ମାର୍ଟ ଫ୍ରେଟ୍ ପୂର୍ବାନୁମାନ · ଜାହାଜ ଚାର୍ଟରିଂ · ବଲ୍କ କାର୍ଗୋ କ୍ରୟ", nav_dashboard:"କମାଣ୍ଡ ଡ୍ୟାସବୋର୍ଡ", nav_forecast:"ଫ୍ରେଟ୍ ପୂର୍ବାନୁମାନ", nav_fleet:"ଫ୍ଲିଟ୍ ଏବଂ ଜିପିଏସ୍ ଟ୍ରାକିଂ", nav_ports:"ବନ୍ଦର ବୁଦ୍ଧିମତ୍ତା", nav_vessels:"ଜାହାଜ ଅପ୍ଟିମାଇଜର", nav_shipper:"ଶିପର୍ କାର୍ଯ୍ୟକ୍ଷେତ୍ର", nav_contracts:"ଚୁକ୍ତି ବୁଦ୍ଧିମତ୍ତା", nav_risk:"ବିପଦ କେନ୍ଦ୍ର", nav_alerts:"ସତର୍କତା", nav_audit:"ଅଡିଟ୍ ଲଗ୍", nav_users:"ଉପଭୋକ୍ତା ପରିଚାଳନା", nav_reports:"ରିପୋର୍ଟ କେନ୍ଦ୍ର", btn_signin:"ସାଇନ୍ ଇନ୍", btn_signout:"ସାଇନ୍ ଆଉଟ୍", btn_submit:"ଦାଖଲ କରନ୍ତୁ", btn_export_csv:"CSV ରପ୍ତାନି", btn_print:"ପ୍ରିଣ୍ଟ / ପିଡିଏଫ୍ ସେଭ୍", btn_generate:"ସୃଷ୍ଟି କରନ୍ତୁ", loading:"ଲୋଡ୍ ହେଉଛି…", search:"ଖୋଜନ୍ତୁ", status:"ସ୍ଥିତି", active:"ସକ୍ରିୟ", available:"ଉପଲବ୍ଧ", email:"ଇମେଲ୍", password:"ପାସୱାର୍ଡ", reduced_motion:"କମ୍ ଆନିମେସନ୍", language:"ଭାଷା", theme:"ଥିମ୍", currency:"ମୁଦ୍ରା", welcome:"ସ୍ୱାଗତ", no_data:"କୌଣସି ତଥ୍ୟ ଉପଲବ୍ଧ ନାହିଁ।" },
as: { brand_tagline:"স্মাৰ্ট ফ্ৰেইট পূৰ্বানুমান · জাহাজ চাৰ্টাৰিং · বাল্ক কাৰ্গো ক্ৰয়", nav_dashboard:"কমাণ্ড ডেশ্ববৰ্ড", nav_forecast:"ফ্ৰেইট পূৰ্বানুমান", nav_fleet:"ফ্লীট আৰু জিপিএছ ট্ৰেকিং", nav_ports:"বন্দৰ বুদ্ধিমত্তা", nav_vessels:"জাহাজ অপ্টিমাইজাৰ", nav_shipper:"শ্বিপাৰ কৰ্মক্ষেত্ৰ", nav_contracts:"চুক্তি বুদ্ধিমত্তা", nav_risk:"বিপদ কেন্দ্ৰ", nav_alerts:"সতৰ্কবাণী", nav_audit:"অডিট লগ", nav_users:"ব্যৱহাৰকাৰী পৰিচালনা", nav_reports:"প্ৰতিবেদন কেন্দ্ৰ", btn_signin:"ছাইন ইন", btn_signout:"ছাইন আউট", btn_submit:"দাখিল কৰক", btn_export_csv:"CSV ৰপ্তানি", btn_print:"প্ৰিণ্ট / পিডিএফ ছেভ", btn_generate:"সৃষ্টি কৰক", loading:"লোড হৈ আছে…", search:"বিচাৰক", status:"অৱস্থা", active:"সক্ৰিয়", available:"উপলব্ধ", email:"ইমেইল", password:"পাছৱৰ্ড", reduced_motion:"কম এনিমেশ্বন", language:"ভাষা", theme:"থিম", currency:"মুদ্ৰা", welcome:"স্বাগতম", no_data:"কোনো তথ্য উপলব্ধ নাই।" },
ur: { brand_tagline:"سمارٹ فریٹ پیشن گوئی · بحری جہاز چارٹرنگ · تھوک کارگو خریداری", nav_dashboard:"کمانڈ ڈیش بورڈ", nav_forecast:"فریٹ پیشن گوئی", nav_fleet:"بیڑا اور جی پی ایس ٹریکنگ", nav_ports:"بندرگاہ انٹیلیجنس", nav_vessels:"جہاز آپٹیمائزر", nav_shipper:"شپر ورک اسپیس", nav_contracts:"معاہدہ انٹیلیجنس", nav_risk:"خطرہ مرکز", nav_alerts:"انتباہات", nav_audit:"آڈٹ لاگ", nav_users:"صارف کا انتظام", nav_reports:"رپورٹس مرکز", btn_signin:"سائن ان", btn_signout:"سائن آؤٹ", btn_submit:"جمع کریں", btn_export_csv:"CSV برآمد کریں", btn_print:"پرنٹ / پی ڈی ایف محفوظ کریں", btn_generate:"تخلیق کریں", loading:"لوڈ ہو رہا ہے…", search:"تلاش کریں", status:"حیثیت", active:"فعال", available:"دستیاب", email:"ای میل", password:"پاس ورڈ", reduced_motion:"کم حرکت", language:"زبان", theme:"تھیم", currency:"کرنسی", welcome:"خوش آمدید", no_data:"کوئی ڈیٹا دستیاب نہیں۔" },
es: { brand_tagline:"Previsión Inteligente de Fletes · Fletamento de Buques · Adquisición de Carga a Granel", nav_dashboard:"Panel de Mando", nav_forecast:"Previsión de Flete", nav_fleet:"Flota y Seguimiento GPS", nav_ports:"Inteligencia Portuaria", nav_vessels:"Optimizador de Buques", nav_shipper:"Espacio del Cargador", nav_contracts:"Inteligencia de Contratos", nav_risk:"Centro de Riesgos", nav_alerts:"Alertas", nav_audit:"Registro de Auditoría", nav_users:"Gestión de Usuarios", nav_reports:"Centro de Informes", btn_signin:"Iniciar Sesión", btn_signout:"Cerrar Sesión", btn_submit:"Enviar", btn_export_csv:"Exportar CSV", btn_print:"Imprimir / Guardar como PDF", btn_generate:"Generar", loading:"Cargando…", search:"Buscar", status:"Estado", active:"Activo", available:"Disponible", email:"Correo electrónico", password:"Contraseña", reduced_motion:"Movimiento reducido", language:"Idioma", theme:"Tema", currency:"Moneda", welcome:"Bienvenido", no_data:"No hay datos disponibles." },
fr: { brand_tagline:"Prévision Intelligente du Fret · Affrètement de Navires · Achat de Vrac", nav_dashboard:"Tableau de Bord", nav_forecast:"Prévision de Fret", nav_fleet:"Flotte et Suivi GPS", nav_ports:"Intelligence Portuaire", nav_vessels:"Optimiseur de Navires", nav_shipper:"Espace Chargeur", nav_contracts:"Intelligence Contractuelle", nav_risk:"Centre de Risques", nav_alerts:"Alertes", nav_audit:"Journal d'Audit", nav_users:"Gestion des Utilisateurs", nav_reports:"Centre de Rapports", btn_signin:"Se Connecter", btn_signout:"Se Déconnecter", btn_submit:"Soumettre", btn_export_csv:"Exporter CSV", btn_print:"Imprimer / Enregistrer en PDF", btn_generate:"Générer", loading:"Chargement…", search:"Rechercher", status:"Statut", active:"Actif", available:"Disponible", email:"E-mail", password:"Mot de passe", reduced_motion:"Mouvement réduit", language:"Langue", theme:"Thème", currency:"Devise", welcome:"Bienvenue", no_data:"Aucune donnée disponible." },
ar: { brand_tagline:"التنبؤ الذكي بأسعار الشحن · استئجار السفن · شراء البضائع السائبة", nav_dashboard:"لوحة القيادة", nav_forecast:"توقعات الشحن", nav_fleet:"الأسطول وتتبع GPS", nav_ports:"استخبارات الموانئ", nav_vessels:"محسّن السفن", nav_shipper:"مساحة عمل الشاحن", nav_contracts:"استخبارات العقود", nav_risk:"مركز المخاطر", nav_alerts:"التنبيهات", nav_audit:"سجل التدقيق", nav_users:"إدارة المستخدمين", nav_reports:"مركز التقارير", btn_signin:"تسجيل الدخول", btn_signout:"تسجيل الخروج", btn_submit:"إرسال", btn_export_csv:"تصدير CSV", btn_print:"طباعة / حفظ كـ PDF", btn_generate:"إنشاء", loading:"جارٍ التحميل…", search:"بحث", status:"الحالة", active:"نشط", available:"متاح", email:"البريد الإلكتروني", password:"كلمة المرور", reduced_motion:"حركة أقل", language:"اللغة", theme:"السمة", currency:"العملة", welcome:"مرحباً", no_data:"لا توجد بيانات متاحة." },
zh: { brand_tagline:"智能运费预测 · 船舶租船 · 散货采购", nav_dashboard:"指挥仪表盘", nav_forecast:"运费预测", nav_fleet:"船队与GPS跟踪", nav_ports:"港口情报", nav_vessels:"船舶优化器", nav_shipper:"托运人工作区", nav_contracts:"合同智能", nav_risk:"风险中心", nav_alerts:"警报", nav_audit:"审计日志", nav_users:"用户管理", nav_reports:"报告中心", btn_signin:"登录", btn_signout:"登出", btn_submit:"提交", btn_export_csv:"导出CSV", btn_print:"打印 / 另存为PDF", btn_generate:"生成", loading:"加载中…", search:"搜索", status:"状态", active:"活跃", available:"可用", email:"电子邮件", password:"密码", reduced_motion:"减少动画", language:"语言", theme:"主题", currency:"货币", welcome:"欢迎", no_data:"暂无数据。" },
};

const FIQ_RTL_LANGS = ['ur', 'ar'];

function fiqCurrentLang() {
  return localStorage.getItem('fiq_lang') || 'en';
}

function fiqT(key) {
  const lang = fiqCurrentLang();
  return (FIQ_TRANSLATIONS[lang] && FIQ_TRANSLATIONS[lang][key]) || (FIQ_TRANSLATIONS.en[key]) || key;
}

function fiqApplyTranslations() {
  const lang = fiqCurrentLang();
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', FIQ_RTL_LANGS.includes(lang) ? 'rtl' : 'ltr');
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = fiqT(key);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.setAttribute('placeholder', fiqT(el.getAttribute('data-i18n-placeholder')));
  });
}

function fiqSetLanguage(code) {
  localStorage.setItem('fiq_lang', code);
  fiqApplyTranslations();
  // Dynamic content (tables, cards, badges built in JS template strings) is
  // re-rendered by each page from its cached data. Pages already listen for
  // 'fiq-refresh-money' (currency switch), so reuse it as the generic
  // "re-render your view" signal, plus a dedicated language event.
  window.dispatchEvent(new CustomEvent('fiq-lang-changed'));
  document.dispatchEvent(new CustomEvent('fiq-refresh-money'));
}

/** Translate a database enum value (status / risk level) for display only.
 *  The underlying value (and CSS class names derived from it) stay English;
 *  only the visible label changes. Unknown values fall through untouched. */
const FIQ_ENUM_KEYS = {
  'Available':'st_available','On Voyage':'st_on_voyage','Idle':'st_idle','Under Repair':'st_under_repair',
  'Active':'st_active','Draft':'st_draft','Completed':'st_completed','Cancelled':'st_cancelled',
  'Open':'st_open','Resolved':'st_resolved',
  'Low':'lv_low','Moderate':'lv_moderate','High':'lv_high','Severe':'lv_severe',
};
function fiqEnum(word) {
  const key = FIQ_ENUM_KEYS[word];
  return key ? fiqT(key) : word;
}

function fiqBuildLanguageSwitcher(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const current = fiqCurrentLang();
  el.innerHTML = `<select id="langSwitcher">${FIQ_LANGUAGES.map(l => `<option value="${l.code}" ${l.code===current?'selected':''}>${l.native}</option>`).join('')}</select>`;
  document.getElementById('langSwitcher').addEventListener('change', (e) => fiqSetLanguage(e.target.value));
}

document.addEventListener('DOMContentLoaded', fiqApplyTranslations);


/** BCP-47 locale for dates/times/number formatting in the active UI language. */
function fiqLocale() {
  const m = { hi: 'hi-IN', bn: 'bn-IN', te: 'te-IN', mr: 'mr-IN', ta: 'ta-IN', gu: 'gu-IN', kn: 'kn-IN', ml: 'ml-IN', pa: 'pa-IN', or: 'or-IN', as: 'as-IN', ur: 'ur-IN', es: 'es', fr: 'fr', ar: 'ar', zh: 'zh-CN', en: 'en-IN' };
  return m[fiqCurrentLang()] || 'en-IN';
}
