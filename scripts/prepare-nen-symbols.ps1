# Outlines of the six approved kanji; no font needs to load on the device/export.
Add-Type -AssemblyName System.Drawing
$symbols = [ordered]@{ enhancement=0x5F37; transmutation=0x5909; conjuration=0x5177; specialization=0x7279; manipulation=0x64CD; emission=0x653E }
$font = [System.Drawing.FontFamily]::new('Yu Gothic')
$out = [ordered]@{}
$culture = [System.Globalization.CultureInfo]::InvariantCulture
function Number($n) { return $n.ToString('0.##',$culture) }
foreach($id in $symbols.Keys){
  $path=[System.Drawing.Drawing2D.GraphicsPath]::new()
  $path.AddString([string][char]$symbols[$id],$font,[int][System.Drawing.FontStyle]::Bold,1000,[System.Drawing.PointF]::new(0,0),[System.Drawing.StringFormat]::GenericTypographic)
  $points=$path.PathPoints; $types=$path.PathTypes; $d=[System.Text.StringBuilder]::new()
  for($i=0;$i -lt $points.Length;$i++){
    $kind=$types[$i] -band 7
    if($kind -eq 0){[void]$d.Append('M'+(Number $points[$i].X)+' '+(Number $points[$i].Y))}
    elseif($kind -eq 1){[void]$d.Append('L'+(Number $points[$i].X)+' '+(Number $points[$i].Y))}
    elseif($kind -eq 3){
      [void]$d.Append('C'+(Number $points[$i].X)+' '+(Number $points[$i].Y)+' '+(Number $points[$i+1].X)+' '+(Number $points[$i+1].Y)+' '+(Number $points[$i+2].X)+' '+(Number $points[$i+2].Y));$i+=2
    }
    if(($types[$i] -band 128) -ne 0){[void]$d.Append('Z')}
  }
  $bounds=$path.GetBounds()
  $out[$id]=[ordered]@{symbol=[string][char]$symbols[$id];viewBox=((Number $bounds.X)+' '+(Number $bounds.Y)+' '+(Number $bounds.Width)+' '+(Number $bounds.Height));path=$d.ToString()}
  $path.Dispose()
}
$font.Dispose()
[System.IO.File]::WriteAllText((Join-Path (Get-Location) 'src/data/nenSymbols.json'),($out | ConvertTo-Json -Depth 4),[System.Text.UTF8Encoding]::new($false))
