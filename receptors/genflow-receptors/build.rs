use std::process::Command;

fn main() {
    println!("cargo:rerun-if-changed=build.rs");
    if let Ok(o) = Command::new("rustc").arg("--version").output() {
        let v = String::from_utf8_lossy(&o.stdout).replace('\n', " ");
        println!("::warning file=receptors/genflow-receptors/build.rs,line=1::RUSTC_VERSION: {v}");
    }
}
