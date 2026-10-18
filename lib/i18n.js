// Bangla text for the English interface. Key = the English text exactly as written in the code.
// Anything not listed here (product names, custom category names, ...) simply stays as it is.
// Numbers always stay in English digits (0-9).
export const BN = {
  // menu
  'Flash Sale': 'ফ্ল্যাশ সেল',
  'New Arrivals': 'নতুন কালেকশন',
  'Women': 'নারী',
  'Men': 'পুরুষ',
  'Accessories': 'এক্সেসরিজ',
  'Cosmetics': 'কসমেটিক্স',
  'Shoes': 'জুতা',
  'Sale': 'সেল',
  'About Us': 'আমাদের সম্পর্কে',
  'Track Order': 'অর্ডার ট্র্যাক',
  'Currency': 'মুদ্রা',
  'Language': 'ভাষা',
  'Loading...': 'লোড হচ্ছে...',
  'Could not load. Tap to try again': 'লোড করা যায়নি। আবার চেষ্টা করতে ট্যাপ করুন',
  'Nothing here yet': 'এখানে এখনো কিছু নেই',
  // bottom bar
  'Home': 'হোম',
  'Call': 'কল',
  'WhatsApp': 'হোয়াটসঅ্যাপ',
  'Track': 'ট্র্যাক',
  'Account': 'অ্যাকাউন্ট',
  // home page
  'New In': 'নতুন এসেছে',
  'Discover Collection': 'কালেকশন দেখুন',
  'Shop Men': 'পুরুষদের কালেকশন',
  'Latest Arrivals': 'সর্বশেষ কালেকশন',
  'Complete Your Look': 'লুক সম্পূর্ণ করুন',
  'Recently Viewed': 'সম্প্রতি দেখেছেন',
  'Fast Delivery': 'দ্রুত ডেলিভারি',
  'Nationwide delivery across Bangladesh.': 'সারা বাংলাদেশে ডেলিভারি।',
  'Easy Returns': 'সহজ রিটার্ন',
  'Simple return experience for eligible products.': 'যোগ্য পণ্যে সহজ রিটার্ন সুবিধা।',
  'Secure Checkout': 'নিরাপদ চেকআউট',
  'Your customer information stays protected.': 'আপনার তথ্য সুরক্ষিত থাকে।',
  'Customer Support': 'কাস্টমার সাপোর্ট',
  "We're here to help with your orders.": 'আপনার অর্ডারে সাহায্য করতে আমরা আছি।',
  'What Our Customers Say': 'আমাদের কাস্টমাররা যা বলেন',
  'Pay With': 'পেমেন্ট করুন',
  // product cards
  'No products available right now.': 'এই মুহূর্তে কোনো পণ্য নেই।',
  'SOLD OUT': 'স্টক শেষ',
  'Buy Now': 'এখনই কিনুন',
  'Only {n} left': 'মাত্র {n}টি আছে',
  'NEW': 'নতুন',
  'SALE': 'সেল',
  // flash sale
  'View all →': 'সব দেখুন →',
  'Ends in {t}': 'শেষ হবে {t} পরে',
  'LIMITED TIME': 'সীমিত সময়',
  'ENDS IN': 'শেষ হবে',
  'ENDED': 'শেষ',
  // footer
  'Modern fashion with timeless elegance. Discover our latest collections and find your signature style.': 'আধুনিক ফ্যাশন, চিরকালীন সৌন্দর্যে। আমাদের নতুন কালেকশন দেখুন আর খুঁজে নিন নিজের স্টাইল।',
  'SHOP': 'শপ',
  'HELP': 'সাহায্য',
  'FOLLOW': 'ফলো করুন',
  'Contact Us': 'যোগাযোগ',
  'Shipping': 'ডেলিভারি',
  'Returns': 'রিটার্ন',
  '© 2026 HEAVEN. All rights reserved.': '© 2026 HEAVEN। সর্বস্বত্ব সংরক্ষিত।',
  'Privacy Policy': 'গোপনীয়তা নীতি',
  'Terms & Conditions': 'শর্তাবলি'
}

const LOWER = {}
Object.keys(BN).forEach(k => { LOWER[k.toLowerCase()] = BN[k] })

// text -> text in the chosen language ('en' returns it unchanged). {name} placeholders are filled from vars.
export function translate(text, lang, vars) {
  let out = text
  if (lang === 'bn' && typeof text === 'string') {
    const hit = BN[text] || LOWER[text.toLowerCase()]
    if (hit) out = hit
  }
  if (vars && typeof out === 'string') {
    Object.keys(vars).forEach(k => { out = out.split('{' + k + '}').join(String(vars[k])) })
  }
  return out
}
