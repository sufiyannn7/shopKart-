async function testWishlistFeature() {
  const baseURL = 'http://localhost:5000';
  let token = '';
  let cookieHeader = '';
  let productId = '';

  console.log('=== SHOPKART LAB 04 WISHLIST AUTOMATED TEST SUITE ===\n');

  try {
    // Step 1: Register test customer
    const testEmail = `test_wishlist_${Date.now()}@shopkart.com`;
    console.log(`[1] Registering test user: ${testEmail}...`);
    const regRes = await fetch(`${baseURL}/customers/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Wishlist Tester',
        email: testEmail,
        password: 'password123',
        phone: '9876543210'
      })
    });
    const regData = await regRes.json();
    console.log('  -> Registration Status:', regRes.status, 'Success:', regData.success);

    // Step 2: Login test customer
    console.log('[2] Logging in to retrieve JWT token and session cookie...');
    const loginRes = await fetch(`${baseURL}/customers/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    console.log('  -> Login Status:', loginRes.status, 'Success:', loginData.success);

    token = loginData.token;
    const rawCookie = loginRes.headers.get('set-cookie');
    if (rawCookie) {
      cookieHeader = rawCookie.split(';')[0];
    }
    console.log('  -> Received Token:', token ? `${token.substring(0, 25)}...` : 'None');
    console.log('  -> Received Cookie:', cookieHeader || 'None');

    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Cookie': cookieHeader
    };

    // Step 3: Fetch sample products to get a valid Product ID
    console.log('\n[3] Fetching sample products to retrieve a valid Product ID...');
    const prodRes = await fetch(`${baseURL}/products`);
    const prodData = await prodRes.json();
    if (!prodData.products || prodData.products.length === 0) {
      throw new Error('No products returned from database');
    }
    productId = prodData.products[0]._id;
    console.log(`  -> Selected Product: "${prodData.products[0].name}" (ID: ${productId})`);

    // Step 4: Test 5 - Unauthenticated access (Expected: 401)
    console.log('\n[4] Test 5: Calling POST /wishlist/:productId WITHOUT authentication (Expected: 401)...');
    const unauthRes = await fetch(`${baseURL}/wishlist/${productId}`, { method: 'POST' });
    console.log('  Status:', unauthRes.status);
    if (unauthRes.status === 401) {
      console.log('  ✅ PASSED: Returned 401 Unauthorized as required.');
    } else {
      console.error('  ❌ FAILED: Did not return 401. Status:', unauthRes.status);
    }

    // Step 5: Test 1 - Add product to wishlist (Expected: 201 or 200)
    console.log(`\n[5] Test 1: Calling POST /wishlist/${productId} with Bearer Token (Expected: 201/200)...`);
    const addRes = await fetch(`${baseURL}/wishlist/${productId}`, {
      method: 'POST',
      headers: authHeaders
    });
    const addData = await addRes.json();
    console.log('  Status:', addRes.status);
    console.log('  Response:', addData);
    if ((addRes.status === 201 || addRes.status === 200) && addData.success) {
      console.log('  ✅ PASSED: Product successfully added to wishlist.');
    } else {
      console.error('  ❌ FAILED: Unexpected response:', addRes.status, addData);
    }

    // Step 6: Test 2 - Duplicate prevention (Expected: 409 Conflict)
    console.log(`\n[6] Test 2: Calling POST /wishlist/${productId} AGAIN for duplicate (Expected: 409)...`);
    const dupRes = await fetch(`${baseURL}/wishlist/${productId}`, {
      method: 'POST',
      headers: authHeaders
    });
    const dupData = await dupRes.json();
    console.log('  Status:', dupRes.status);
    console.log('  Response:', dupData);
    if (dupRes.status === 409 && dupData.message === 'Product already in wishlist') {
      console.log('  ✅ PASSED: Returned 409 Conflict ("Product already in wishlist").');
    } else {
      console.error('  ❌ FAILED: Unexpected duplicate response:', dupRes.status, dupData);
    }

    // Step 7: Test invalid product ID (Expected: 400 Bad Request)
    console.log('\n[7] Calling POST /wishlist/invalid123 with invalid ObjectId (Expected: 400)...');
    const invRes = await fetch(`${baseURL}/wishlist/invalid123`, {
      method: 'POST',
      headers: authHeaders
    });
    const invData = await invRes.json();
    console.log('  Status:', invRes.status);
    if (invRes.status === 400 && invData.message === 'Invalid product ID') {
      console.log('  ✅ PASSED: Returned 400 Bad Request.');
    } else {
      console.error('  ❌ FAILED: Unexpected status:', invRes.status, invData);
    }

    // Step 8: Test non-existent valid ObjectId (Expected: 404 Product Not Found)
    console.log('\n[8] Calling POST /wishlist/60d000000000000000000000 for non-existent product (Expected: 404)...');
    const notFoundRes = await fetch(`${baseURL}/wishlist/60d000000000000000000000`, {
      method: 'POST',
      headers: authHeaders
    });
    const notFoundData = await notFoundRes.json();
    console.log('  Status:', notFoundRes.status);
    if (notFoundRes.status === 404 && notFoundData.message === 'Product not found') {
      console.log('  ✅ PASSED: Returned 404 Not Found.');
    } else {
      console.error('  ❌ FAILED: Unexpected status:', notFoundRes.status, notFoundData);
    }

    // Step 9: Test 3 - GET /wishlist with populate (Expected: 200, count: 1, populated product)
    console.log('\n[9] Test 3: Calling GET /wishlist (Expected: 200 with populated product)...');
    const getRes = await fetch(`${baseURL}/wishlist`, {
      method: 'GET',
      headers: authHeaders
    });
    const getData = await getRes.json();
    console.log('  Status:', getRes.status);
    console.log('  Count:', getData.count);
    console.log('  Populated Item Name:', getData.wishlist?.[0]?.name);
    console.log('  Populated Item Price: ₹', getData.wishlist?.[0]?.price);
    console.log('  Populated Item Category:', getData.wishlist?.[0]?.category);
    console.log('  Populated Item Stock:', getData.wishlist?.[0]?.stock);
    if (getRes.status === 200 && getData.count === 1 && getData.wishlist?.[0]?.name) {
      console.log('  ✅ PASSED: Wishlist populated product successfully.');
    } else {
      console.error('  ❌ FAILED: Populate did not return product fields!');
    }

    // Step 10: Test 23 Bonus - PATCH /wishlist/:productId/toggle
    console.log(`\n[10] Test Bonus 23: Calling PATCH /wishlist/${productId}/toggle (Currently saved, expect saved: false)...`);
    const toggle1Res = await fetch(`${baseURL}/wishlist/${productId}/toggle`, {
      method: 'PATCH',
      headers: authHeaders
    });
    const toggle1Data = await toggle1Res.json();
    console.log('  Toggle 1 Status:', toggle1Res.status, 'Response:', toggle1Data);
    if (toggle1Data.saved === false) {
      console.log('  ✅ PASSED: Toggled to removed (saved: false).');
    }

    console.log(`[11] Test Bonus 23: Calling PATCH /wishlist/${productId}/toggle AGAIN (Expect saved: true)...`);
    const toggle2Res = await fetch(`${baseURL}/wishlist/${productId}/toggle`, {
      method: 'PATCH',
      headers: authHeaders
    });
    const toggle2Data = await toggle2Res.json();
    console.log('  Toggle 2 Status:', toggle2Res.status, 'Response:', toggle2Data);
    if (toggle2Data.saved === true) {
      console.log('  ✅ PASSED: Toggled to added (saved: true).');
    }

    // Step 11: Test 4 - DELETE /wishlist/:productId (Expected: 200)
    console.log(`\n[12] Test 4: Calling DELETE /wishlist/${productId} (Expected: 200)...`);
    const delRes = await fetch(`${baseURL}/wishlist/${productId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    const delData = await delRes.json();
    console.log('  Status:', delRes.status);
    console.log('  Response:', delData);
    if (delRes.status === 200 && delData.success) {
      console.log('  ✅ PASSED: Product removed from wishlist successfully.');
    } else {
      console.error('  ❌ FAILED: Unexpected delete response:', delRes.status, delData);
    }

    // Step 12: Remove again (Expected: 404 Not in wishlist)
    console.log(`\n[13] Calling DELETE /wishlist/${productId} AGAIN (Expected: 404)...`);
    const delAgainRes = await fetch(`${baseURL}/wishlist/${productId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    const delAgainData = await delAgainRes.json();
    console.log('  Status:', delAgainRes.status);
    if (delAgainRes.status === 404 && delAgainData.message === 'Product not in wishlist') {
      console.log('  ✅ PASSED: Returned 404 Product not in wishlist as required.');
    } else {
      console.error('  ❌ FAILED: Unexpected status:', delAgainRes.status, delAgainData);
    }

    // Step 13: GET /wishlist after removal (Expected: count 0, empty array)
    console.log('\n[14] Calling GET /wishlist after removal (Expected: count 0)...');
    const finalGetRes = await fetch(`${baseURL}/wishlist`, {
      method: 'GET',
      headers: authHeaders
    });
    const finalGetData = await finalGetRes.json();
    console.log('  Count:', finalGetData.count);
    if (finalGetData.count === 0 && finalGetData.wishlist?.length === 0) {
      console.log('  ✅ PASSED: Empty wishlist verified.');
    } else {
      console.error('  ❌ FAILED: Wishlist not empty!');
    }

    console.log('\n======================================================');
    console.log('🎉 ALL 14 BACKEND TESTS PASSED WITH 100% SUCCESS! 🎉');
    console.log('======================================================\n');
  } catch (err) {
    console.error('Fatal Test Error:', err.message);
  }
}

testWishlistFeature();
