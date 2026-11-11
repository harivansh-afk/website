'l1: loop {
    l5 = l3;
    l6 = expect_int(vm.container_len(l1)?)?;
    l4 = l5 < l6;
    if l4 {
        l9 = l3;
        l7 = expect_int(vm.load_array_element(l1, Value::int(l9))?)?;
        l2 = vm.add_i64(l2, l7)?;
        l3 = vm.add_i64(l3, 1)?;
        continue 'l1;
    } else {
        return Ok(l2);
    }
}
