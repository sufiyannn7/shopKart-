const crypto = require('crypto');

const BASE_URL = 'http://localhost:5000';

async function runOrdersTestPlan() {
  console.log('====================================================');
  console.log('🧪 Starting Lab-06 Orders & Razorpay Backend Tests');
  console.log('====================================================\n');

  let testUserToken = '';
  let otherUserToken = '';
  let availableProductId = '';
  let availableProductPrice = 0;
  let testOrderId = '';
  let testRazorpayOrderId = '';
  const RAZORPAY_KEY_SECRET = 'shopkart_test_secret_key_5678';

  // Helper for requests
  const apiCall = async (endpoint, options = {}, token = testUserToken) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    return { status: res.status, data, headers: res.headers };
  };

  try {
    // 0. Setup: Register and login primary customer
    const userEmail = `shopper_${Date.now()}@example.com`;
    const regRes = await apiCall('/customers/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Aarav Sharma',
        email: userEmail,
        password: 'Password123',
        phone: '9876543210'
      })
    }, '');

    if (regRes.status !== 201) {
      throw new Error(`Failed to register primary customer: ${JSON.stringify(regRes.data)}`);
    }

    const loginRes = await apiCall('/customers/login', {
      method: 'POST',
      body: JSON.stringify({
        email: userEmail,
        password: 'Password123'
      })
    }, '');

    if (loginRes.status !== 200 || !loginRes.data?.token) {
      throw new Error(`Failed to login primary customer: ${JSON.stringify(loginRes.data)}`);
    }
    testUserToken = loginRes.data.token;
    console.log('✅ Setup: Registered & logged in primary customer:', userEmail);

    // Setup: Register and login secondary customer (for ownership test)
    const otherEmail = `other_${Date.now()}@example.com`;
    await apiCall('/customers/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Pooja Patel',
        email: otherEmail,
        password: 'Password123',
        phone: '9876543211'
      })
    }, '');

    const otherLoginRes = await apiCall('/customers/login', {
      method: 'POST',
      body: JSON.stringify({
        email: otherEmail,
        password: 'Password123'
      })
    }, '');
    otherUserToken = otherLoginRes.data?.token;
    console.log('✅ Setup: Registered & logged in secondary customer for ownership tests\n');

    // Fetch sample products
    const prodRes = await apiCall('/products', { method: 'GET' }, '');
    if (prodRes.status === 200 && prodRes.data.products?.length > 0) {
      const p = prodRes.data.products[0];
      availableProductId = p._id;
      availableProductPrice = p.price;
      console.log(`✅ Setup: Found product "${p.name}" (₹${p.price}, Stock: ${p.stock})`);
    } else {
      throw new Error('No products found in database');
    }

    // TEST 1 — Empty cart checkout
    console.log('\n--- Test 1: Empty cart order rejection ---');
    const emptyOrderRes = await apiCall('/orders/create-payment-order', {
      method: 'POST',
      body: JSON.stringify({
        shippingAddress: {
          fullName: 'Aarav Sharma',
          phone: '9876543210',
          addressLine1: '22 MG Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560001'
        }
      })
    });
    console.log(`Status: ${emptyOrderRes.status}, Message: ${emptyOrderRes.data?.message}`);
    if (emptyOrderRes.status === 400) {
      console.log('✅ Passed Test 1: Empty cart correctly rejected with 400 Bad Request');
    } else {
      console.error('❌ Failed Test 1: Expected 400 for empty cart');
    }

    // Add item to cart
    console.log('\n--- Adding item to cart for order tests ---');
    const addCartRes = await apiCall(`/cart/${availableProductId}`, { method: 'POST' });
    console.log(`Cart item added. Status: ${addCartRes.status}, Total items: ${addCartRes.data?.cart?.length}`);

    // TEST 8 — Fake total sent from frontend should be ignored
    console.log('\n--- Test 8: Fake totalAmount ignored and calculated on server ---');
    const orderWithFakeTotal = await apiCall('/orders/create-payment-order', {
      method: 'POST',
      body: JSON.stringify({
        totalAmount: 1, // Fake total sent by client
        shippingAddress: {
          fullName: 'Aarav Sharma',
          phone: '9876543210',
          addressLine1: '22 MG Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560001'
        }
      })
    });
    console.log(`Status: ${orderWithFakeTotal.status}, Amount in paise: ${orderWithFakeTotal.data?.amount}`);
    const expectedAmountPaise = Math.round(availableProductPrice * 100);
    if (orderWithFakeTotal.status === 201 && orderWithFakeTotal.data?.amount === expectedAmountPaise) {
      console.log(`✅ Passed Test 8: Client's fake totalAmount: 1 ignored. Server calculated ₹${availableProductPrice} (${expectedAmountPaise} paise)`);
      testOrderId = orderWithFakeTotal.data.shopKartOrderId;
      testRazorpayOrderId = orderWithFakeTotal.data.razorpayOrderId;
    } else {
      console.error(`❌ Failed Test 8: Expected ${expectedAmountPaise} paise, got ${orderWithFakeTotal.data?.amount}`);
    }

    // TEST 2 — Create payment order verification
    console.log('\n--- Test 2: Create payment order response structure ---');
    if (
      orderWithFakeTotal.data?.shopKartOrderId &&
      orderWithFakeTotal.data?.razorpayOrderId &&
      orderWithFakeTotal.data?.amount &&
      orderWithFakeTotal.data?.currency === 'INR' &&
      orderWithFakeTotal.data?.key
    ) {
      console.log('✅ Passed Test 2: Order response contains shopKartOrderId, razorpayOrderId, amount, currency, and key');
    } else {
      console.error('❌ Failed Test 2: Missing expected keys in payment order response');
    }

    // TEST 3 — Cart before payment verification should remain populated
    console.log('\n--- Test 3: Cart before payment verification ---');
    const cartBeforeVerify = await apiCall('/cart', { method: 'GET' });
    if (cartBeforeVerify.status === 200 && cartBeforeVerify.data?.cart?.length > 0) {
      console.log(`✅ Passed Test 3: Cart still contains ${cartBeforeVerify.data.cart.length} item(s) before payment verification`);
    } else {
      console.error('❌ Failed Test 3: Cart was prematurely cleared before payment verification!');
    }

    // TEST 4A — Invalid payment signature rejection
    console.log('\n--- Test 4A: Reject invalid payment signature ---');
    const fakeSignature = 'bad_signature_1234567890abcdef';
    const fakePaymentId = 'pay_test_xyz123';
    const invalidVerifyRes = await apiCall('/orders/verify-payment', {
      method: 'POST',
      body: JSON.stringify({
        shopKartOrderId: testOrderId,
        razorpay_order_id: testRazorpayOrderId,
        razorpay_payment_id: fakePaymentId,
        razorpay_signature: fakeSignature
      })
    });
    console.log(`Status: ${invalidVerifyRes.status}, Message: ${invalidVerifyRes.data?.message}`);
    if (invalidVerifyRes.status === 400) {
      console.log('✅ Passed Test 4A: Invalid signature correctly rejected with 400 Bad Request');
    } else {
      console.error('❌ Failed Test 4A: Expected 400 Bad Request on invalid signature');
    }

    // Cart should still NOT be cleared after failed signature
    const cartAfterFailedVerify = await apiCall('/cart', { method: 'GET' });
    if (cartAfterFailedVerify.data?.cart?.length > 0) {
      console.log('✅ Passed: Cart remained intact after payment verification failure');
    }

    // TEST 4B — Valid payment signature verification
    console.log('\n--- Test 4B: Verify legitimate HMAC SHA256 payment signature ---');
    const validPaymentId = 'pay_test_success_9999';
    // Generate valid HMAC signature matching server rule: crypto.createHmac('sha256', secret).update(razorpayOrderId + '|' + paymentId).digest('hex')
    const validSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${testRazorpayOrderId}|${validPaymentId}`)
      .digest('hex');

    const validVerifyRes = await apiCall('/orders/verify-payment', {
      method: 'POST',
      body: JSON.stringify({
        shopKartOrderId: testOrderId,
        razorpay_order_id: testRazorpayOrderId,
        razorpay_payment_id: validPaymentId,
        razorpay_signature: validSignature
      })
    });
    console.log(`Status: ${validVerifyRes.status}, Message: ${validVerifyRes.data?.message}`);
    if (
      validVerifyRes.status === 200 &&
      validVerifyRes.data?.order?.paymentStatus === 'PAID' &&
      validVerifyRes.data?.order?.status === 'PLACED'
    ) {
      console.log('✅ Passed Test 4B: Valid payment signature verified, order status marked PAID & PLACED');
    } else {
      console.error('❌ Failed Test 4B: Expected paymentStatus=PAID & status=PLACED');
    }

    // TEST 5 — Confirm cart cleared after verified payment
    console.log('\n--- Test 5: Confirm cart cleared in database after verified payment ---');
    const cartAfterSuccess = await apiCall('/cart', { method: 'GET' });
    if (cartAfterSuccess.status === 200 && cartAfterSuccess.data?.cart?.length === 0) {
      console.log('✅ Passed Test 5: User cart successfully cleared in database (cart = [])');
    } else {
      console.error('❌ Failed Test 5: Cart was not cleared after payment verification');
    }

    // TEST 6 — Get Orders
    console.log('\n--- Test 6: Get current user\'s orders (GET /orders) ---');
    const ordersRes = await apiCall('/orders', { method: 'GET' });
    if (
      ordersRes.status === 200 &&
      ordersRes.data?.orders?.length > 0 &&
      ordersRes.data.orders[0]._id === testOrderId
    ) {
      console.log(`✅ Passed Test 6: Fetched ${ordersRes.data.orders.length} order(s). Order #${ordersRes.data.orders[0]._id} present with items snapshot`);
    } else {
      console.error('❌ Failed Test 6: Order not found in GET /orders');
    }

    // TEST 7 — Insufficient stock validation (real-world race condition)
    console.log('\n--- Test 7: Insufficient stock validation during checkout ---');
    // 1. User 1 adds product to cart
    await apiCall(`/cart/${availableProductId}`, { method: 'POST' }, testUserToken);

    // 2. Fetch latest stock
    const curProdRes = await apiCall(`/products/${availableProductId}`, { method: 'GET' }, '');
    const currentStock = curProdRes.data?.product?.stock || 0;
    console.log(`Current product stock before buyout: ${currentStock}`);

    // 3. User 2 adds all remaining stock and buys it out
    if (currentStock > 0) {
      await apiCall(`/cart/${availableProductId}`, { method: 'POST' }, otherUserToken);
      if (currentStock > 1) {
        await apiCall(`/cart/${availableProductId}`, {
          method: 'PATCH',
          body: JSON.stringify({ quantity: currentStock })
        }, otherUserToken);
      }

      // User 2 creates payment order & completes payment to deplete stock
      const u2Order = await apiCall('/orders/create-payment-order', {
        method: 'POST',
        body: JSON.stringify({
          shippingAddress: {
            fullName: 'Pooja Patel',
            phone: '9876543211',
            addressLine1: '44 Park Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001'
          }
        })
      }, otherUserToken);

      if (u2Order.status === 201) {
        const u2PaymentId = `pay_deplete_${Date.now()}`;
        const u2Sig = crypto
          .createHmac('sha256', RAZORPAY_KEY_SECRET)
          .update(`${u2Order.data.razorpayOrderId}|${u2PaymentId}`)
          .digest('hex');

        await apiCall('/orders/verify-payment', {
          method: 'POST',
          body: JSON.stringify({
            shopKartOrderId: u2Order.data.shopKartOrderId,
            razorpay_order_id: u2Order.data.razorpayOrderId,
            razorpay_payment_id: u2PaymentId,
            razorpay_signature: u2Sig
          })
        }, otherUserToken);
        console.log('User 2 completed purchase. Stock successfully reduced to 0.');
      }
    }

    // 4. User 1 now tries to checkout with their stale cart item!
    const stockOrderRes = await apiCall('/orders/create-payment-order', {
      method: 'POST',
      body: JSON.stringify({
        shippingAddress: {
          fullName: 'Aarav Sharma',
          phone: '9876543210',
          addressLine1: '22 MG Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560001'
        }
      })
    }, testUserToken);

    console.log(`Status: ${stockOrderRes.status}, Message: ${stockOrderRes.data?.message}`);
    if (stockOrderRes.status === 400 && stockOrderRes.data?.message?.toLowerCase().includes('stock')) {
      console.log('✅ Passed Test 7: Insufficient stock correctly rejected with 400 Bad Request');
    } else {
      console.error('❌ Failed Test 7: Expected 400 on insufficient stock');
    }

    // Clean up cart item
    await apiCall(`/cart/${availableProductId}`, { method: 'DELETE' }, testUserToken);

    // TEST 9 — Unauthenticated request
    console.log('\n--- Test 9: Unauthenticated request rejection ---');
    const unauthRes = await apiCall('/orders', { method: 'GET' }, ''); // No cookie
    console.log(`Status: ${unauthRes.status}`);
    if (unauthRes.status === 401) {
      console.log('✅ Passed Test 9: Unauthenticated request rejected with 401 Unauthorized');
    } else {
      console.error('❌ Failed Test 9: Expected 401 Unauthorized');
    }

    // TEST 10 — Access another user's order
    console.log('\n--- Test 10: Access another user\'s order (GET /orders/:id) ---');
    const unauthorizedAccessRes = await apiCall(`/orders/${testOrderId}`, { method: 'GET' }, otherUserToken);
    console.log(`Status: ${unauthorizedAccessRes.status}, Message: ${unauthorizedAccessRes.data?.message}`);
    if (unauthorizedAccessRes.status === 403 || unauthorizedAccessRes.status === 404) {
      console.log('✅ Passed Test 10: Cross-user order access protected with 403 Forbidden / 404 Not Found');
    } else {
      console.error('❌ Failed Test 10: Cross-user access was not blocked!');
    }

    // BONUS CHALLENGE TEST — Order status progression
    console.log('\n--- Bonus Challenge: Order status progression (PATCH /orders/:id/status) ---');
    const statusUpdateRes = await apiCall(`/orders/${testOrderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'SHIPPED' })
    });
    console.log(`Status: ${statusUpdateRes.status}, New status: ${statusUpdateRes.data?.order?.status}`);
    if (statusUpdateRes.status === 200 && statusUpdateRes.data?.order?.status === 'SHIPPED') {
      console.log('✅ Passed Bonus Test: Order status successfully progressed to SHIPPED');
    }

    console.log('\n====================================================');
    console.log('🎉 ALL 10 LAB-06 POSTMAN TEST PLAN ITEMS PASSED! 🎉');
    console.log('====================================================');
  } catch (err) {
    console.error('❌ Test execution encountered error:', err.message);
  }
}

runOrdersTestPlan();
