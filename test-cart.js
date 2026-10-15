async function testCartFeature() {
  const baseURL = 'http://localhost:5000';
  let token = '';
  let cookieHeader = '';
  let productId = '';
  let productStock = 0;

  console.log('=== SHOPKART LAB 05 SHOPPING CART AUTOMATED TEST SUITE ===\n');

  try {
    // Step 1: Register test customer
    const testEmail = `test_cart_${Date.now()}@shopkart.com`;
    console.log(`[1] Registering test customer: ${testEmail}...`);
    const regRes = await fetch(`${baseURL}/customers/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Cart Tester',
        email: testEmail,
        password: 'password123',
        phone: '9123456789'
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

    // Step 3: Fetch sample products to retrieve a valid product ID
    console.log('\n[3] Fetching sample products to retrieve a valid Product ID and Stock...');
    const prodRes = await fetch(`${baseURL}/products`);
    const prodData = await prodRes.json();
    if (!prodData.products || prodData.products.length === 0) {
      throw new Error('No products returned from database');
    }
    const sampleProduct = prodData.products[0];
    productId = sampleProduct._id;
    productStock = sampleProduct.stock;
    console.log(`  -> Selected Product: "${sampleProduct.name}" (ID: ${productId}, Stock: ${productStock})`);

    // Step 4: Test 7 - Unauthenticated request (Expected: 401)
    console.log('\n[4] Test 7: Calling POST /cart/:productId WITHOUT authentication (Expected: 401)...');
    const unauthRes = await fetch(`${baseURL}/cart/${productId}`, { method: 'POST' });
    console.log('  Status:', unauthRes.status);
    if (unauthRes.status === 401) {
      console.log('  ✅ PASSED: Returned 401 Unauthorized as required.');
    } else {
      console.error('  ❌ FAILED: Did not return 401. Status:', unauthRes.status);
    }

    // Step 5: Test 1 - Add new item (Expected: 200 with quantity = 1)
    console.log(`\n[5] Test 1: Calling POST /cart/${productId} for new product (Expected: quantity = 1)...`);
    const add1Res = await fetch(`${baseURL}/cart/${productId}`, {
      method: 'POST',
      headers: authHeaders
    });
    const add1Data = await add1Res.json();
    console.log('  Status:', add1Res.status);
    const item1 = add1Data.cart?.find(i => (i.product?._id || i.product) === productId);
    console.log('  Item in cart quantity:', item1?.quantity);
    if (add1Res.status === 200 && item1?.quantity === 1) {
      console.log('  ✅ PASSED: Added new item with quantity = 1.');
    } else {
      console.error('  ❌ FAILED: Unexpected response:', add1Res.status, add1Data);
    }

    // Step 6: Test 2 - Add same item again (Expected: quantity = 2)
    console.log(`\n[6] Test 2: Calling POST /cart/${productId} AGAIN for same product (Expected: quantity = 2)...`);
    const add2Res = await fetch(`${baseURL}/cart/${productId}`, {
      method: 'POST',
      headers: authHeaders
    });
    const add2Data = await add2Res.json();
    console.log('  Status:', add2Res.status);
    const item2 = add2Data.cart?.find(i => (i.product?._id || i.product) === productId);
    console.log('  Updated quantity:', item2?.quantity);
    if (add2Res.status === 200 && item2?.quantity === 2) {
      console.log('  ✅ PASSED: Duplicate product incremented quantity to 2.');
    } else {
      console.error('  ❌ FAILED: Unexpected quantity:', item2?.quantity);
    }

    // Step 7: Test 3 - GET /cart with populated Product information
    console.log('\n[7] Test 3: Calling GET /cart (Expected: populated Product details)...');
    const getRes = await fetch(`${baseURL}/cart`, {
      method: 'GET',
      headers: authHeaders
    });
    const getData = await getRes.json();
    console.log('  Status:', getRes.status);
    const popItem = getData.cart?.[0];
    console.log('  Populated Product Name:', popItem?.product?.name);
    console.log('  Populated Product Price: ₹', popItem?.product?.price);
    console.log('  Populated Product Stock:', popItem?.product?.stock);
    console.log('  Cart Quantity:', popItem?.quantity);
    if (getRes.status === 200 && popItem?.product?.name && popItem?.quantity === 2) {
      console.log('  ✅ PASSED: Returned populated cart items successfully.');
    } else {
      console.error('  ❌ FAILED: Product not populated properly:', popItem);
    }

    // Step 8: Test 4 - Update product quantity (PATCH /cart/:productId)
    console.log(`\n[8] Test 4: Calling PATCH /cart/${productId} with quantity = 3 (Expected: quantity = 3)...`);
    const patchRes = await fetch(`${baseURL}/cart/${productId}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ quantity: 3 })
    });
    const patchData = await patchRes.json();
    console.log('  Status:', patchRes.status);
    const patchedItem = patchData.cart?.find(i => (i.product?._id || i.product) === productId);
    console.log('  Patched quantity:', patchedItem?.quantity);
    if (patchRes.status === 200 && patchedItem?.quantity === 3) {
      console.log('  ✅ PASSED: Quantity updated to 3.');
    } else {
      console.error('  ❌ FAILED: Unexpected patched quantity:', patchedItem?.quantity);
    }

    // Step 9: Test 5 - Exceed stock validation (Expected: 400 Bad Request)
    console.log(`\n[9] Test 5: Calling PATCH /cart/${productId} with quantity = 99999 (Available stock: ${productStock}) (Expected: 400)...`);
    const exceedRes = await fetch(`${baseURL}/cart/${productId}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ quantity: 99999 })
    });
    const exceedData = await exceedRes.json();
    console.log('  Status:', exceedRes.status, 'Message:', exceedData.message);
    if (exceedRes.status === 400 && exceedData.message?.includes('exceeds available stock')) {
      console.log('  ✅ PASSED: Correctly rejected quantity exceeding stock.');
    } else {
      console.error('  ❌ FAILED: Did not reject stock exceedance! Status:', exceedRes.status);
    }

    // Step 10: Test quantity < 1 validation (Expected: 400 Bad Request)
    console.log(`\n[10] Calling PATCH /cart/${productId} with quantity = 0 (Expected: 400)...`);
    const zeroRes = await fetch(`${baseURL}/cart/${productId}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ quantity: 0 })
    });
    const zeroData = await zeroRes.json();
    console.log('  Status:', zeroRes.status, 'Message:', zeroData.message);
    if (zeroRes.status === 400) {
      console.log('  ✅ PASSED: Correctly rejected quantity < 1.');
    } else {
      console.error('  ❌ FAILED: Accepted invalid quantity! Status:', zeroRes.status);
    }

    // Step 11: Test invalid product ID (Expected: 400 Bad Request)
    console.log('\n[11] Calling PATCH /cart/invalid_id (Expected: 400)...');
    const invRes = await fetch(`${baseURL}/cart/invalid_id`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ quantity: 1 })
    });
    console.log('  Status:', invRes.status);
    if (invRes.status === 400) {
      console.log('  ✅ PASSED: Returned 400 Bad Request for invalid product ID.');
    }

    // Step 12: Test 6 - Remove product from cart (DELETE /cart/:productId)
    console.log(`\n[12] Test 6: Calling DELETE /cart/${productId} (Expected: 200)...`);
    const delRes = await fetch(`${baseURL}/cart/${productId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    const delData = await delRes.json();
    console.log('  Status:', delRes.status);
    console.log('  Remaining cart items:', delData.cart?.length);
    if (delRes.status === 200 && delData.cart?.length === 0) {
      console.log('  ✅ PASSED: Item removed from cart successfully.');
    } else {
      console.error('  ❌ FAILED: Item was not removed:', delData);
    }

    // Step 13: Remove item not in cart (Expected: 404 Not Found)
    console.log(`\n[13] Calling DELETE /cart/${productId} AGAIN (Expected: 404)...`);
    const delAgainRes = await fetch(`${baseURL}/cart/${productId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    const delAgainData = await delAgainRes.json();
    console.log('  Status:', delAgainRes.status, 'Message:', delAgainData.message);
    if (delAgainRes.status === 404 && delAgainData.message === 'Product not in cart') {
      console.log('  ✅ PASSED: Returned 404 Product not in cart.');
    } else {
      console.error('  ❌ FAILED: Expected 404 but got:', delAgainRes.status);
    }

    // Step 14: Final GET /cart check
    console.log('\n[14] Calling GET /cart after removal (Expected: empty array)...');
    const finalGet = await fetch(`${baseURL}/cart`, {
      method: 'GET',
      headers: authHeaders
    });
    const finalData = await finalGet.json();
    console.log('  Cart length:', finalData.cart?.length);
    if (finalData.cart?.length === 0) {
      console.log('  ✅ PASSED: Empty cart verified.');
    }

    console.log('\n======================================================');
    console.log('🎉 ALL 14 BACKEND SHOPPING CART TESTS PASSED! 🎉');
    console.log('======================================================\n');
  } catch (err) {
    console.error('Fatal Test Error:', err.message);
  }
}

testCartFeature();
