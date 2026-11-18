let mut block = 0;
loop {
    match block {
        0 => { total = 0; i = 0; block = 1; }
        1 => { n = len(xs); block = 2; }
        2 => { block = if i < n { 5 } else { 3 }; }
        3 => { result = total; block = 4; }
        4 => return result,
        5 => { total += xs[i]; i += 1; block = 1; }
        _ => unreachable!(),
    }
}
